$(document).ready(() => {
  autosize($('#comment textarea'));

  $('#comment').submit((e) => {
    e.preventDefault();

    $.ajax({
      url: '/comment',
      method: 'POST',
      data: $('#comment').serialize(),
      success: (result) => {
        console.log(result);
        $('#comments').prepend(createCommentRow([result.results]));
        $('#commentsContainer h5').addClass('d-none');
      },
      complete: () => {
        $('#comment textarea').val('');
      },
    });
  });

  $('#comment textarea').keypress((e) => {
    if (e.keyCode === 13 && !(e.shiftKey || e.ctrlKey || e.altKey)) {
      e.preventDefault();
      $('#comment').submit();
    }
  });

  function createCommentRow(comments, isReply = false) {
    const rows = [];

    if (comments) {
      comments.forEach((comment) => {
        const row = $(`
          <div class='comment row'>
            <div class='col-md-3 my-3 text-center' id='${comment._id}'>
              <img src='${img(comment.user.photo)}' style='height: 80px; width: auto;'>
            </div>
            <div class='col-md-9 my-3'>
              <div class='row'>
                <div class='col-md-12'>
                  <a style='text-decoration: none;' href='/user/view/${comment.user._id}'>@${comment.user.username}</a> | 
                  <span class='text-muted'>${datePrint(new Date(comment.date))}</span>
                </div>
              </div>
              ${comment.replyTo ? (`<div class='row'><div class='col-md-8'><b>Reply To: </b> <a href='#${comment.replyTo._id}'>@${comment.replyTo.user.username}'s comment</a></div><div class='col-md-4'></div></div>`) : ' '}
              <div class='row'>
                <p class='col-md-8'> ${comment.content}</p>
                <div class='col-md-4'>
                  <div class='row'>
                    <div class='col-md-12'>
                      <span class='upvotes' data-num="${comment.upvote}">${abbreviateNumber(comment.upvote)}</span> <i class="far fa-thumbs-up"></i> - 
                      <span class='downvotes' data-num="${comment.downvote}">${abbreviateNumber(comment.downvote)}</span> <i class="far fa-thumbs-down"></i>
                    </div>
                  </div>
                  <div class='row'>
                    <div class='col-md-12 my-1'>
                      <button type="submit" class="w-100 upvote btn btn-sm btn-labeled btn-success" data-type='up'>
                        <span class="btn-label"><i class="far fa-thumbs-up"></i></span>
                        Upvote
                      </button>
                    </div>
                  </div>

                  <div class='row'>
                    <div class='col-md-12 my-1'>
                      <button type="submit" class="w-100 downvote btn btn-sm btn-labeled btn-danger" data-type='down'>
                        <span class="btn-label"><i class="far fa-thumbs-down"></i></span>
                        Downvote
                      </button>
                    </div>
                  </div>
    <div class='row'>
                      <div class='col-md-12'>
                        <button class="reply btn btn-outline-success btn-sm w-100 my-2" data-to='${comment._id}' data-user='${comment.user.username}'>Reply</button>
                      </div>
                    </div>

                  ${comment.replies.length > 0
    ? `<div class='row'>
                    <div class='col-md-12 my-1'>
                      <button class="view-replies w-100 downvote btn btn-sm btn-labeled btn-outline-primary" data-page='1' data-skip='0'>
                        View Replies
                      </button>
                    </div>
                  </div>` : ''}

                  ${comment.owner
    ? `<div class='row'>
                      <div class='col-md-12'>
                        <button class="delete btn btn-danger btn-sm w-100 my-2">Delete</button>
                      </div>
                    </div>` : ''}
                </div>
              </div>
              <div class='replyRow row'>
              </div>
            </div>
            <div class='replies row ${comment.review ? 'ms-5' : ''}'>
            </div>
            <hr/>
          </div>
        `);

        const replyRow = $(`
          <div class='col-md-8'>
            <div class='row'>
              <div class='col-md-12'>
                <label for="comment"><b>Replying to <a class="replyTo" href='#${comment._id}' style='text-decoration: none'>@${comment.user.username}'s comment</a></b></label>
                <div class="form-floating">
                  <textarea class="form-control" placeholder="Leave a reply here" name="reply" data-to="${comment._id}"></textarea>
                  <label for="comment">Leave a reply here, press enter to submit your reply...</label>
                </div>
              </div>
            </div>
          </div>
          <div class='col-md-4'></div>
        `);

        row.find('.reply').click((e) => {
          const el = $(e.target);
          const parent = row.parents('.comment');
          const repRow = row.find('.replyRow');

          if (row.parents('.comment').length > 0) {
            parent.find('.replyRow textarea').attr('data-to', el.attr('data-to'));
            parent.find('.replyRow a').attr('href', `#${el.attr('data-to')}`);
            parent.find('.replyRow a').text(`@${el.attr('data-user')}'s comment`);
          } else {
            repRow.find('textarea').attr('data-to', el.attr('data-to'));
            repRow.find('a').attr('href', `#${el.attr('data-to')}`);
            repRow.find('a').text(`@${el.attr('data-user')}'s comment`);
          }

          console.log({
            scrollTop: (parent.length > 0) ? parent.offset().top : replyRow.offset().top,
          })
          $('body').animate({
            scrollTop: (parent.length > 0) ? parent.offset().top : replyRow.offset().top,
          }, 2000);
        });

        replyRow.find('textarea').keypress((e) => {
          const el = $(e.target);

          if (e.keyCode === 13 && !(e.shiftKey || e.ctrlKey || e.altKey)) {
            e.preventDefault();

            $.ajax({
              url: '/comment',
              method: 'POST',
              data: {
                content: el.val(),
                replyTo: el.attr('data-to'),
              },
              success: (result) => {
                if (result.success) {
                  result.results = {
                    ...result.results,
                    replyTo: comment,
                  };

                  row.find('> .replies').prepend(createCommentRow([result.results], true));
                  replyRow.find('textarea').val('');
                }
              },
            });
          }
        });

        if (comment.user) {
          if (!isReply) row.find('.replyRow').append(replyRow);
        }

        row.find('.delete').click((e) => {
          $.ajax({
            url: '/comment',
            method: 'DELETE',
            data: {
              comment: comment._id,
            },
            success: (result) => {
              if (result.success) {
                row.remove();
              }
            },
          });
        });

        row.find('.view-replies').click((e) => {
          const el = $(e.target);

          row.find('.replies').empty();
          el.attr('data-page', 1);
          el.attr('data-skip', 0);
          loadReplies(comment._id, row.find('.replies'), el);
        });

        rows.push(row);
      });
    }

    return rows;
  }

  function loadReplies(cid, row, el) {
    const page = parseInt(el.attr('data-page'), 10);
    const skip = parseInt(el.attr('data-skip'), 10);

    $.ajax({
      url: `/comment/replies/${cid}`,
      method: 'GET',
      data: { page, skip },
      success: (result) => {
        const res = result.results;

        if (res.totalDocs > 0) {
          row.append(createCommentRow(res.docs, true));
        }
      },
    });
  }

  function loadComments(page, skip) {
    $('#loadMore').addClass('d-none');
    $('#commentsContainer .spinner').removeClass('d-none');

    $.ajax({
      url: `/comment/${$('input[name=review]').val()}`,
      data: { page, skip },
      method: 'GET',
      success: (result) => {
        const res = result.results;

        if (res.totalDocs > 0) {
          $('#commentsContainer h5').addClass('d-none');

          $('#comments').append(createCommentRow(res.docs));

          $('#loadMore').off('click');
          if (res.hasNextPage) {
            $('#loadMore').removeClass('d-none');
            $('#loadMore').click((e) => {
              loadComments(res.nextPage, (res.nextPage - 1) * 1);
            });
          }
        } else {
          $('#commentsContainer h5').removeClass('d-none');
        }
      },
      complete: () => {
        $('#commentsContainer .spinner').addClass('d-none');
      },
    });
  }

  loadComments(1, 0);
});
