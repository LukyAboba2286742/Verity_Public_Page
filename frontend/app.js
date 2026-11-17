const form = document.querySelector('#message-form');
const statusLine = document.querySelector('#form-status');
const commentsList = document.querySelector('#comments-list');

function formatCommentDate(timestamp) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(timestamp));
}

function renderComments(comments) {
  commentsList.replaceChildren();

  if (!comments.length) {
    const empty = document.createElement('p');
    empty.className = 'comments-empty';
    empty.textContent = 'Пока комментариев нет. Будь первым!';
    commentsList.append(empty);
    return;
  }

  comments.forEach((comment) => {
    const article = document.createElement('article');
    article.className = 'visitor-comment';

    const header = document.createElement('div');
    header.className = 'visitor-comment-header';

    const author = document.createElement('strong');
    author.className = 'visitor-comment-author';
    author.textContent = comment.sender;

    const date = document.createElement('time');
    date.className = 'visitor-comment-date';
    date.dateTime = new Date(comment.createdAt).toISOString();
    date.textContent = formatCommentDate(comment.createdAt);

    const body = document.createElement('p');
    body.className = 'visitor-comment-text';
    body.textContent = comment.message;

    header.append(author, date);
    article.append(header, body);
    commentsList.append(article);
  });
}

async function loadComments() {
  try {
    const response = await fetch('/api/feedback');
    if (!response.ok) throw new Error('Не удалось загрузить комментарии');
    renderComments(await response.json());
  } catch (error) {
    commentsList.replaceChildren();
    const message = document.createElement('p');
    message.className = 'comments-empty';
    message.textContent = 'Не удалось загрузить комментарии. Обнови страницу позже.';
    commentsList.append(message);
    console.error(error);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusLine.textContent = 'Отправка...';
  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Не удалось отправить сообщение');

    statusLine.textContent = result.message;
    form.reset();
    await loadComments();
  } catch (error) {
    statusLine.textContent = error.message || 'Сервер недоступен. Попробуйте позже.';
    console.error(error);
  }
});

loadComments();
