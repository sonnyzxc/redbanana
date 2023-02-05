'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import LineCounter from './LineCounter';
import Gitignore from './Gitignore';
import * as JSONC from 'jsonc-parser';
import * as minimatch from 'minimatch';
import { TextDecoder, TextEncoder } from 'util';
// import { debug } from 'console';
import * as fs from 'fs';

const EXTENSION_NAME = 'VSCodeCounter';
const CONFIGURATION_SECTION = 'VSCodeCounter';
const toZeroPadString = (num: number, fig: number) => num.toString().padStart(fig, '0');
const dateToString = (date: Date) => `${date.getFullYear()}-${toZeroPadString(date.getMonth()+1, 2)}-${toZeroPadString(date.getDate(), 2)}`
                + ` ${toZeroPadString(date.getHours(), 2)}:${toZeroPadString(date.getMinutes(), 2)}:${toZeroPadString(date.getSeconds(), 2)}`;
const toStringWithCommas = (obj: any) => {
    if (typeof obj === 'number') {
        return new Intl.NumberFormat('en-US').format(obj);
    } else {
        return obj.toString();
    }
};
const log = (message: string, ...items:any[]) => console.log(`[${EXTENSION_NAME}] ${new Date().toISOString()} ${message}`, ...items);
const showError = (message: string, ...items:any[]) => vscode.window.showErrorMessage(`[${EXTENSION_NAME}] ${message}`, ...items);
async function fun() {
	const codeCountController = new CodeCounterController();
	codeCountController.countInWorkspace()
}

export function activate(context: vscode.ExtensionContext) {
    const codeCountController = new CodeCounterController();
    context.subscriptions.push(
        codeCountController,
        vscode.commands.registerCommand('ichack23.helloWorld', () => setInterval(fun, 1000)),
    );

}

export function deactivate() {
}

async function currentWorkspaceFolder() {
    const folders = vscode.workspace.workspaceFolders ?? [];
    if (folders.length <= 0) {
        return undefined;
    } else if (folders.length === 1) {
        return folders[0];
    } else {
        return await vscode.window.showWorkspaceFolderPick();
    }
}

class CodeCounterController {
    private codeCounter_: LineCounterTable|null = null;
    private outputChannel: vscode.OutputChannel|null = null;
    private disposable: vscode.Disposable;

    constructor() {
        // subscribe to selection change and editor activation events
        let subscriptions: vscode.Disposable[] = [];
        // create a combined disposable from both event subscriptions
        this.disposable = vscode.Disposable.from(...subscriptions);
    }
    dispose() {
        this.outputChannel?.dispose();
        this.outputChannel = null;
        this.disposable.dispose();
        this.codeCounter_ = null;
    }
    private async getCodeCounter() {
        if (this.codeCounter_) {
            return this.codeCounter_
        }
        const langs = await loadLanguageConfigurations();        
        log(`load Language Settings = ${langs.size}`);
        await collectLanguageConfigurations(langs);
        log(`collect Language Settings = ${langs.size}`);
        const filesConf = vscode.workspace.getConfiguration("files", null);
        this.codeCounter_ = new LineCounterTable(langs, Object.entries(filesConf.get<{[key:string]:string}>('associations', {})));
        //this.saveLanguageConfigurations(langs);
        return this.codeCounter_;
    }

    public async countInWorkspace() {
        try {
            const folder = await currentWorkspaceFolder();
            if (folder) {
                this.countLinesInDirectory(folder.uri, folder.uri);
            } else {
                showError(`No folder are open.`);
            }
        } catch (e) {
            showError(`countInWorkspace() failed.`);
        }
    }
    private countLinesInDirectory(targetUri: vscode.Uri, workspaceDir: vscode.Uri) {
        const conf = vscode.workspace.getConfiguration(CONFIGURATION_SECTION);
        const outputDir = buildUri(workspaceDir, conf.get('outputDirectory', '.VSCodeCounter'));
        this.getCodeCounter()
        .then(c => countLinesInDirectory(c, targetUri, outputDir, conf, this.toOutputChannel))
		.then(results => outputResults(targetUri, results, outputDir, conf))
        .catch(reason => showError(`countLinesInDirectory() failed.`, reason));
   }

    private toOutputChannel(text: string) {
        if (!this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);
        }
        this.outputChannel.show();
        this.outputChannel.appendLine(text);
    }

}
const encodingTable = new Map<string, string>([
    ['big5hkscs',    'big5-hkscs'],
    ['eucjp',        'euc-jp'],
    ['euckr',        'euc-kr'],
    ['iso885916',    'iso-8859-16'],
    ['koi8r',        'koi8-r'],
    ['koi8ru',       'koi8-ru'],
    ['koi8t',        'koi8-t'],
    ['koi8u',        'koi8-u'],
    ['macroman',     'x-mac-roman'],
    ['shiftjis',     'shift-jis'],
    ['utf16be',      'utf-16be'],
    ['utf16le',      'utf-16le'],
    ['utf8bom',      'utf8'],
    ['windows1250',  'windows-1250'],
    ['windows1251',  'windows-1251'],
    ['windows1252',  'windows-1252'],
    ['windows1253',  'windows-1253'],
    ['windows1254',  'windows-1254'],
    ['windows1255',  'windows-1255'],
    ['windows1256',  'windows-1256'],
    ['windows1257',  'windows-1257'],
    ['windows1258',  'windows-1258'],
    ['windows874',   'windows-874'],
]);

const buildUri = (uri: vscode.Uri, filename: string) => uri.with({path: `${uri.path}/${filename}`});
const dirUri = (uri: vscode.Uri) => uri.with({path: path.dirname(uri.path)});

function readFileAll(fileUris: vscode.Uri[]) : Promise<{uri:vscode.Uri, data:Uint8Array|null, error?:any}[]> {
    const ret: {uri:vscode.Uri, data:Uint8Array|null, error?:any}[] = [];
    return new Promise((resolve: (values: {uri:vscode.Uri, data:Uint8Array|null, error?:any}[])=> void, reject: (reason: any) => void) => {
        if (fileUris.length > 0) {
            fileUris.forEach(fileUri => {
                vscode.workspace.fs.readFile(fileUri).then(data => {
                    log(`readfile : ${fileUri} : ${data.length}B`);
                    ret.push({uri:fileUri, data: data});
                    if (ret.length === fileUris.length) {
                        resolve(ret);
                    }
                },
                (reason:any) => {
                    log(`readfile : ${fileUri} : error ${reason}`);
                    ret.push({uri:fileUri, data: null, error: reason});
                    if (ret.length === fileUris.length) {
                        resolve(ret);
                    }
                });
            });
        } else {
            resolve(ret);
        }
    });
}
function countLinesInDirectory(lineCounterTable: LineCounterTable, targetUri: vscode.Uri, outputDir: vscode.Uri, configuration: vscode.WorkspaceConfiguration, consoleOut:(text:string)=>void) {
    log(`countLinesInDirectory : ${targetUri}, output dir: ${outputDir.fsPath}`);
    const confFiles = vscode.workspace.getConfiguration("files", null);
    const includes = configuration.get<string[]>('include', ['**/*']);
    const excludes = configuration.get<string[]>('exclude', []);
    if (configuration.get('useFilesExclude', true)) {
        excludes.push(...Object.keys(confFiles.get<object>('exclude', {})));
    }
    const encoding = confFiles.get('encoding', 'utf8');
    const decoder = new TextDecoder(encodingTable.get(encoding) || encoding);
    const decoderU8 = new TextDecoder('utf8');

    excludes.push(vscode.workspace.asRelativePath(outputDir));
    log(`includes : "${includes.join('", "')}"`);
    log(`excludes : "${excludes.join('", "')}"`);

    return new Promise((resolve: (p: vscode.Uri[])=> void, reject: (reason: any) => void) => {
        vscode.workspace.findFiles(`{${includes.join(',')}}`, `{${excludes.join(',')}}`).then((files: vscode.Uri[]) => {
            const fileUris = files.filter(uri => uri.path.startsWith(targetUri.path));
            if (configuration.get('useGitignore', true)) {
                log(`target : ${fileUris.length} files -> use .gitignore`);
                vscode.workspace.findFiles('**/.gitignore', '').then((gitignoreFiles: vscode.Uri[]) => {
                    gitignoreFiles.forEach(f => log(`use gitignore : ${f}`));
                    readFileAll(gitignoreFiles.sort()).then((values) => {
                        const gitignores = new Gitignore('').merge(...values.map(p => new Gitignore(decoderU8.decode(p.data), dirUri(p.uri).fsPath)));
                        resolve(fileUris.filter(p => gitignores.excludes(p.fsPath)));
                    },
                    reject
                    );
                },
                reject
                );
            } else {
                resolve(fileUris);
            }
        });
    }).then((fileUris: vscode.Uri[]) => {
        log(`target : ${fileUris.length} files`);
        return new Promise((resolve: (value: Result[])=> void, reject: (reason: string) => void) => {
            const results: Result[] = [];
            if (fileUris.length <= 0) {
                resolve(results);
            }
            const ignoreUnsupportedFile = configuration.get('ignoreUnsupportedFile', true);
            let fileCount = 0;
            fileUris.forEach(fileUri => {
                const lineCounter = lineCounterTable.getByUri(fileUri);
                if (lineCounter) {
                    vscode.workspace.fs.readFile(fileUri).then(data => {
                        ++fileCount;
                        try {
                            results.push(new Result(fileUri, lineCounter.name, lineCounter.count(decoder.decode(data))));
                        } catch (e) {
                            results.push(new Result(fileUri, '(Read Error)'));
                        }
                        if (fileCount === fileUris.length) {
                            resolve(results);
                        }
                    },
                    (reason: any) => {
                        consoleOut(`"${fileUri}" Read Error : ${reason}.`);
                        results.push(new Result(fileUri, '(Read Error)'));
                    });
                } else {
                    if (!ignoreUnsupportedFile) {
                        results.push(new Result(fileUri, '(Unsupported)'));
                    }
                    ++fileCount;
                    if (fileCount === fileUris.length) {
                        resolve(results);
                    }
                }
            });
        });
    });
}

type VscodeLanguage = {
    id: string 
    aliases?: string[] 
    filenames?: string[] 
    extensions?: string[] 
    configuration?: string
};
type LanguageConf = {
    aliases: string[]
    filenames: string[]
    extensions: string[]
    lineComments: string[]
    blockComments: [string,string][]
    blockStrings: [string,string][]
}
function pushUnique<T>(array: T[], ...values: T[]) {
    values.forEach(value => {
        if (array.indexOf(value) < 0) {
            array.push(value);
        }
    });
}
const append = (langs: Map<string, LanguageConf>, l:VscodeLanguage) => {
    const langExt = getOrSet(langs, l.id, ():LanguageConf => {
        return {
            aliases:[],
            filenames:[],
            extensions:[],
            lineComments:[], 
            blockComments:[],
            blockStrings:[]
        }
    });
    pushUnique(langExt.aliases, ...(l.aliases??[]));
    pushUnique(langExt.filenames, ...(l.filenames??[]));
    pushUnique(langExt.extensions, ...(l.extensions??[]));
    return langExt;
}

function collectLanguageConfigurations(langs: Map<string, LanguageConf>) : Promise<Map<string, LanguageConf>> {
    return new Promise((resolve: (values: Map<string, LanguageConf>)=> void, reject: (reason: any) => void) => {
        if (vscode.extensions.all.length <= 0) {
            resolve(langs);
        } else {
            let finishedCount = 0;
            let totalCount = 0;
            const decoderU8 = new TextDecoder('utf8');
            vscode.extensions.all.forEach(ex => {
                const languages = ex.packageJSON.contributes?.languages as VscodeLanguage[] ?? undefined;
                if (languages) {
                    totalCount += languages.length
                    languages.forEach(l => {
                        const langExt = append(langs, l);
                        if (l.configuration) {
                            const confUrl = vscode.Uri.file(path.join(ex.extensionPath, l.configuration));
                            vscode.workspace.fs.readFile(confUrl).then(data => {
                                // log(`${confUrl} ${data.length}B :${l.id}`);
                                const langConf = JSONC.parse(decoderU8.decode(data)) as vscode.LanguageConfiguration;
                                if (langConf.comments) {
                                    if (langConf.comments.lineComment) {
                                        pushUnique(langExt.lineComments, langConf.comments.lineComment);
                                    }
                                    if (langConf.comments.blockComment && langConf.comments.blockComment.length >= 2) {
                                        pushUnique(langExt.blockComments, langConf.comments.blockComment);
                                    }
                                }
                                if (++finishedCount >= totalCount) {
                                    resolve(langs);
                                }
                            },
                            (reason:any) => {
                                log(`${confUrl} : error ${reason}`);
                                if (++finishedCount >= totalCount) {
                                    resolve(langs);
                                }
                            });
                
                        } else {
                            if (++finishedCount >= totalCount) {
                                resolve(langs);
                            }
                        }
                    });
                }
            });
        }
    });
}


async function loadLanguageConfigurations_() {
    const conf = vscode.workspace.getConfiguration(CONFIGURATION_SECTION);
    const saveLocation = conf.get<string>('saveLocation', 'global settings');
    if (saveLocation === "global settings") {
        return conf.get<{[key:string]:LanguageConf}>('languages', {});
    } else if (saveLocation === "workspace settings") {
        return conf.get<{[key:string]:LanguageConf}>('languages', {});
    } else if (saveLocation === "output directory") {
        const workFolder = await currentWorkspaceFolder();
        if (!workFolder) return {};
        const outputDirUri = buildUri(workFolder.uri, conf.get('outputDirectory', '.VSCodeCounter'));
        const uri = buildUri(outputDirUri, 'languages.json');
        const data = await vscode.workspace.fs.readFile(uri);
        const decoderU8 = new TextDecoder('utf8');
        return JSONC.parse(decoderU8.decode(data)) as {[key:string]:LanguageConf};
    } else {
        return {};
    }
}
async function loadLanguageConfigurations() {
    return objectToMap(await loadLanguageConfigurations_());
}
class LineCounterTable {
    private langExtensions: Map<string, LanguageConf>;
    private langIdTable: Map<string, LineCounter>;
    private aliasTable: Map<string, LineCounter>;
    private fileextRules: Map<string, LineCounter>;
    private filenameRules: Map<string, LineCounter>;
    private associations: [string, string][];

    constructor(langExtensions: Map<string, LanguageConf>, associations: [string, string][]) {
        this.langExtensions = langExtensions;
        this.langIdTable = new Map<string, LineCounter>();
        this.aliasTable = new Map<string, LineCounter>();
        this.fileextRules = new Map<string, LineCounter>();
        this.filenameRules = new Map<string, LineCounter>();
        this.associations = associations;
        log(`associations : ${this.associations.length}\n[${this.associations.join("],[")}]`);
        langExtensions.forEach((lang, id) => {
            const langName = lang.aliases.length > 0 ? lang.aliases[0] : id;
            const lineCounter = new LineCounter(langName, lang.lineComments, lang.blockComments, lang.blockStrings);
            lang.aliases.forEach(v => this.aliasTable.set(v, lineCounter));
            lang.extensions.forEach(v => this.fileextRules.set(v.startsWith('.') ? v : `.${v}`, lineCounter));
            lang.filenames.forEach(v => this.filenameRules.set(v, lineCounter));
        });
    }
    public entries = () => this.langExtensions;

    public getById(langId: string) {
        return this.langIdTable.get(langId) || this.aliasTable.get(langId);
    }
    public getByPath(filePath: string) {
        const lineCounter = this.fileextRules.get(filePath) || this.fileextRules.get(path.extname(filePath)) || this.filenameRules.get(path.basename(filePath));
        if (lineCounter !== undefined) {
            return lineCounter; 
        }
        const patType = this.associations.find(([pattern, ]) => minimatch(filePath, pattern, {matchBase: true}));
        //log(`## ${filePath}: ${patType}`);
        return (patType !== undefined) ? this.getById(patType[1]) : undefined;
    }
    public getByUri(uri: vscode.Uri) {
        return this.getByPath(uri.fsPath);
    }
}

async function outputResults(workspaceUri: vscode.Uri, results: Result[], outputDirUri: vscode.Uri, conf: vscode.WorkspaceConfiguration) {
	const resultTable = new ResultTable(workspaceUri, results, conf.get('printNumberWithCommas', true) ? toStringWithCommas : (obj:any) => obj.toString() );
	vscode.window.showInformationMessage(resultTable.toMarkdownHeaderLines());
	// writeFileSync(join(__dirname, 'linesandtimes.txt'), resultTable.toMarkdownHeaderLines(), {
	// 	flag: 'w',
	//   });
	// write resultTable.toMarkdownHeaderLines() to linesandtimes.toMarkdown
	// fs.writeFileSync('linesandtimes.txt', resultTable.toMarkdownHeaderLines());

	//Networking

	var dgram = require('dgram');

	var client = dgram.createSocket('udp4');

	
	var dgram = require('dgram');
	var s = dgram.createSocket('udp4');
	s.send(Buffer.from(resultTable.toMarkdownHeaderLines()), 5009, 'localhost');


}

class Result {
    public uri: vscode.Uri;
    public filename: string;
    public language: string;
    public code = 0;
    public comment = 0;
    public blank = 0;
    get total(): number {
        return this.code + this.comment + this.blank;
    }
    constructor(uri: vscode.Uri, language: string, value: {code:number, comment:number, blank:number} ={code:-1,comment:0,blank:0}) {
        this.uri = uri;
        this.filename = uri.fsPath;
        this.language = language;
        this.code = value.code;
        this.comment = value.comment;
        this.blank = value.blank;
    }
}

class Statistics {
    public name: string;
    public files = 0;
    public code = 0;
    public comment = 0;
    public blank = 0;
    get total(): number {
        return this.code + this.comment + this.blank;
    }
    constructor(name: string) {
        this.name = name;
    }
    public append(result: Result) {
        this.files++;
        this.code += result.code;
        this.comment += result.comment;
        this.blank += result.blank;
        return this;
    }
}

class ResultTable {
    private targetDirPath: string;
    private fileResults: Result[] = [];
    private dirResultTable = new Map<string, Statistics>();
    private langResultTable = new Map<string, Statistics>();
    private total = new Statistics('Total');
    private valueToString: (obj:any) => string;

    constructor(workspaceUri: vscode.Uri, results:Result[], valueToString = (obj:any) => obj.toString()) {
        this.targetDirPath = workspaceUri.fsPath;
        this.fileResults = results;
        this.valueToString = valueToString;
        results
        .filter((result) => result.code >= 0)
        .forEach((result) => {
            let parent = path.dirname(path.relative(this.targetDirPath, result.filename));
            while (parent.length >= 0) {
                getOrSet(this.dirResultTable, parent, () => new Statistics(parent)).append(result);
                const p = path.dirname(parent);
                if (p === parent) {
                    break;
                }
                parent = p;
            }
            getOrSet(this.langResultTable, result.language, () => new Statistics(result.language)).append(result);
            this.total.append(result);
        });
    }

    public toMarkdownHeaderLines() {
        return `${this.total.total} lines`;
    }
}

function objectToMap<V>(obj: {[key: string]: V}): Map<string,V> {
    return new Map<string, V>(Object.entries(obj));
}

function getOrSet<K,V>(map: Map<K,V>, key: K, otherwise: () => V) {
    let v = map.get(key);
    if (v === undefined) {
        v = otherwise();
        map.set(key, v);
    }
    return v;
}
