// Pure multiple-choice review engine; no storage or account access.
// The caller must persist results within the authenticated learner workspace.
export function buildReviewQuestions(review, distractors = []) {
  if (!review || !Array.isArray(review.items)) throw Error('Invalid daily review');
  const pool = [...review.items, ...distractors]
    .map(item => String(item?.meaning ?? '').trim()).filter(Boolean);
  return review.items.map((item, index) => {
    const word = String(item?.word ?? '').trim();
    const answer = String(item?.meaning ?? '').trim();
    if (!word || !answer) return null;
    const wrong = [...new Set(pool.filter(value => value !== answer))]
      .slice(index % Math.max(1, pool.length))
      .concat([...new Set(pool.filter(value => value !== answer))])
      .filter((value, i, arr) => arr.indexOf(value) === i)
      .slice(0, 3);
    if (!wrong.length) return null;
    const options = [...wrong, answer];
    const correct = (index + 1) % options.length;
    options.splice(options.indexOf(answer), 1);
    options.splice(correct, 0, answer);
    return { id: word.toLocaleLowerCase('en'), word, options, correct };
  }).filter(Boolean);
}

export function scoreReview(questions, answers) {
  if (!Array.isArray(questions) || !Array.isArray(answers) || answers.length !== questions.length)
    throw Error('Incomplete review');
  const results = questions.map((question, index) => {
    const selected = answers[index];
    if (!Number.isInteger(selected) || selected < 0 || selected >= question.options.length)
      throw Error('Invalid answer');
    return { id: question.id, correct: selected === question.correct };
  });
  return { total: results.length, correct: results.filter(result => result.correct).length, results };
}
