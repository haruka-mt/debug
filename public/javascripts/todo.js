var collectionflag = false;
var collectionName;
// ページが表示されたときToDoリストを表示する
$(function () {
    getCollection();
});

// フォームを送信ボタンを押すと、ToDoを追加して再表示する。
// !!!
//　今，このイベントに飛ばなくて詰まっています．．．
// !!!
$('.makeTodo').submit(function () {
    console.log("~~^^~~");
    saveTodo();
    return false;
});

function getCollection() {
    if (collectionflag == false) {
        $.when($.get('todoName', function (name) {
            console.log('!!' + name);
            $('.todoTitle').append('<h1>' + name + '</h1>');
        })).done(function (name) {
            collectionName = name;
            collectionflag = true;
            console.log('0v0' + collectionName);
            $.get('todosearch', { name: collectionName }, function (list) {
                console.log(list);
            });
        });
    }

    var $list = $('.list');
    $list.fadeOut(function () {
        $list.children().remove();
        // /todolistにGETアクセスする
        $.get('detail', function (todos) {
            // 取得したToDoを追加していく
            $.each(todos, function (index, todo) {
                var limit = new Date(todo.limitDate);
                $list.append('<p><input type="checkbox" ' + (todo.isCheck ? 'checked' : '') + '>' + todo.text + ' (~' + limit.toLocaleString() + ')</p>');
            });
            // 一覧を表示する
            $list.fadeIn();
            console.log(todos);
        });
    });
}

// 文字をエスケープする
function escapeText(text) {
    var TABLE_FOR_ESCAPE_HTML = {
        "&": "&amp;",
        "\"": "&quot;",
        "<": "&lt;",
        ">": "&gt;"
    };
    return text.replace(/[&"<>]/g, function (match) {
        return TABLE_FOR_ESCAPE_HTML[match];
    });
}

// ToDoリスト一覧を取得して表示する
function saveTodo() {
    // フォームに入力された値を取得
    var name = $('#name').val();
    var limitDate = new Date($('#limit').val());
    console.log(name);

    var checked = true;
    if (name.length > 30) {
        alert('Todo名は30文字以下で入力してください．');
    } else {
        $.when($.get('detail', function (lists) {
            $.each(lists, function (index, todolist) {
                if (name == todolist.text) {
                    checked = false;
                    alert('同じ名前のTodoが存在します．');
                    return false; //jQueryでのbreak文
                }
            });
        })).done(function () {
            console.log(checked);
            if (checked) {
                //入力項目を空にする
                $('#name').val('');
                // $('#limit').val('');

                var saveText = escapeText(name);
                // /todoにPOSTアクセスする
                $.post('/detail', { name: saveText, limit: limitDate, target:collectionName }, function (res) {
                    console.log(saveText);
                    //再度表示する
                    //getCollection();
                });
            }
        });
    }
}