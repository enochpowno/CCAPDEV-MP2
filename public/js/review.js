function createComment({_id, comment, user_id, username, date, is_owner, replies}) {
    let comment0 = $(
        `<div class='row py-2 comment' data-id='${_id}'>
            <div class='col-md-12'>
                <div class="row">
                    <div class="col-md-12">
                        <a href="/profile?id=${user_id}">${username}</a> | <b>${datePrint(new Date(date))}</b>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12 px-3">
                       ${comment}
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12 px-3">
                        <textarea id="c${_id}" class="add-reply form-control" rows="1" placeholder="Press enter to leave a reply..."></textarea>
                    </div>
                    <div class="col-md-12 px-3 mt-2">
                        ` + 
                        (replies.length > 0 ? `<a href="#" class="view-replies" data-target="${_id}">View Replies</a>` : ``)
                        + `
                        ` +
                        (is_owner ? `<a class="btn btn-danger btn-sm delete-comment" href="#">Delete Comment</a>` : ``)
                        + `
                    </div>
                </div>
                <div class="row ms-1">
                    <div id="r${_id}">
                    </div>
                </div>
            </div>
        </div>`
    )

    comment0.find('.add-reply').keypress((e) => {
        if (e.keyCode == 13) {
            e.preventDefault()
            addReply(comment0, $(e.target).val())
            $(e.target).val('')
        }
    })

    comment0.find('.view-replies').click((e) => {
        e.preventDefault();

        console.log($(e.target), _id)
        loadReplies(comment0)
    })

    comment0.find(`.delete-comment`).click((e) => {
        e.preventDefault();

        deleteComment(comment0)
    })

    return comment0
}

function loadReplies(comment) {
    let id = comment.attr('data-id')

    $(`#r${id}`).empty()

    $.ajax({
        url: `/movies/review/comment/${id}`,
        method: 'GET',
        success: (data) => {
            if (data.success)
                data.replies.forEach((v, i, a) => {
                    comment.find(`#r${id}`).append(createComment(v))
                })
        }
    })
}

function addReply(comment, value) {
    $.ajax({
        url: '/movies/review/comment/reply',
        method: 'POST',
        data: {
            id: comment.attr('data-id'),
            comment: value
        },
        success: (data) => {
            if(data.success)
                loadReplies(comment)
        }
    })
}

function deleteComment(comment) {
    let id = $(comment).attr('data-id')

    $.ajax({
        url: '/movies/review/comment/delete',
        method: 'POST',
        data: {
            id: id
        },
        success: (data) => {
            if (data.success)
                comment.remove()
        }
    })    
}

$(document).ready(() => {
    
    $('.add-reply').keypress((e) => {
        if (e.keyCode == 13) {
            e.preventDefault()
            console.log($(e.target).parents('.comment'))
            addReply($($(e.target).parents('.comment')[0]), $(e.target).val())
            $(e.target).val('')
        }
    })

    $('.view-replies').click((e) => {
        e.preventDefault();
        
        loadReplies($($(e.target).parents('.comment')[0]))
    })

    $(`.delete-comment`).click((e) => {
        e.preventDefault();

        deleteComment($($(e.target).parents('.comment')[0]))
    })
})