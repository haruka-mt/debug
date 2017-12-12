// ページが表示されたときToDoリストを表示する
$(function () {
    getList();
});

// フォームを送信ボタンを押すと、ToDoを追加して再表示する。
$('#listForm').submit(function () {
    postList();
    return false;
});

// ToDoリスト一覧を取得して表示する
function getList() {
    // すでに表示されている一覧を非表示にして削除する
    var $list = $('.list');
    $list.fadeOut(function () {
        $list.children().remove();
        // /todolistにGETアクセスする
        $.get('todolist', { name: '' }, function (lists) {
            $list.prepend('</ul>');
            // 取得したToDoを追加していく
            $.each(lists, function (index, todolist) {
                var limit = new Date(todolist.limitDate);
                if (todolist.num == 0) {
                    $list.prepend('<li><a href="/tododetail" onClick="clickJump(this)">' + todolist.text + '</a></br>todoがありません．</li>');
                } else {
                    $list.prepend('<li><font size="1.5em"><a href="/tododetail" onClick="clickJump(this)">' + todolist.text + '</a></font></br>全' + todolist.num + '件中' + todolist.checkedNum + '件が達成済み</br>直近の期限：' + limit.toLocaleString() + '</li > ');
                }
            });
            $list.prepend('<ul>');
            // 一覧を表示する
            $list.fadeIn();
        });
        // // /todoにGETアクセスする
        // $.get('todo', function (todos) {
        //     // 取得したToDoを追加していく
        //     $.each(todos, function (index, todo) {
        //         var limit = new Date(todo.limitDate);
        //         $list.append('<p><input type="checkbox" ' + (todo.isCheck ? 'checked' : '') + '>' + todo.text + ' (~' + limit.toLocaleString() + ')</p>');
        //     });
        //     // 一覧を表示する
        //     $list.fadeIn();
        // });
    });
}

function clickJump(obj) {
    $.post('/todoName', { name: obj.text }, function (res) {
        //console.log(obj.text);
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

// フォームに入力されたToDoを追加する
function postList() {
    // フォームに入力された値を取得
    var name = $('#listText').val();
    //var limitDate = new Date($('#limit').val());

    var checked = true;
    if (name.length > 30) {
        alert('リスト名は30文字以下で入力してください．');
    } else {
        $.when($.get('todolist', function (lists) {
            $.each(lists, function (index, todolist) {
                if (name == todolist.text) {
                    checked = false;
                    alert('同じ名前のTodoリストが存在します．');
                    return false; //jQueryでのbreak文
                }
            });
        })).done(function () {
            console.log(checked);
            if (checked) {
                //入力項目を空にする
                $('#text').val('');
                // $('#limit').val('');

                var saveText = escapeText(name);
                // /todoにPOSTアクセスする
                $.post('/todolist', { name: saveText }, function (res) {
                    console.log(saveText);
                    //再度表示する
                    getList();
                });
            }
        });
    }
}