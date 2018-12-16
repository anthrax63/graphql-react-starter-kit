export function capitalize(word) {
  return word.replace(/\b\w/g, (l) => l.toUpperCase());
}

export function deCapitalize(word) {
  return word.replace(/\b\w/g, (l) => l.toLowerCase());
}

export function beautifyId(id) {
  let newId = '';
  for (let i = 0; i < id.length; i++) {
    if (i > 0 && i % 6 === 0 && i < id.length - 1) {
      newId += '-';
    }
    newId += id[i].toUpperCase();
  }
  return newId;
}
