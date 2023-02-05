const sample = {
    "task1" : {
        "task1.1" : "do something cool",
        "task1.2" : {
            "task1.2.1" : "ok"
        }
    },
    "task2" : {
        "task2.1" : "test",
        "task.2.2" : "test2"
    },
    "task3" : "very simple"
}


function objToHtmlList(obj) {
    if (obj instanceof Object) {
        var ul = document.createElement('ul');
        for (var child in obj) {
            var li = document.createElement('li');
            li.appendChild(document.createTextNode(child + ": "));
            li.appendChild(objToHtmlList(obj[child]));
            ul.appendChild(li);
        }
        return ul;
    }
    else {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(obj));
        return li;
    }
}

function displayTodo() {
    document.body.appendChild(objToHtmlList(sample));
}

displayTodo()