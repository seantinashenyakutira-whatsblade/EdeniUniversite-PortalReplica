// Shared utilities for AcademiX
function escapeHtml(input) {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[&<>",'/`=]/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#47;',
      '`': '&#96;',
      '=': '&#61;'
    })[s];
  });
}

function getGradeFromScore(score) {
  const s = parseFloat(score) || 0;
  if (s >= 80) return 'A';
  if (s >= 70) return 'B';
  if (s >= 60) return 'C';
  if (s >= 50) return 'D';
  return 'F';
}

function getScoreFromGrade(grade) {
  if (!grade) return 0;
  const g = String(grade).trim().toUpperCase();
  if (g === 'A') return 85;
  if (g === 'B') return 75;
  if (g === 'C') return 65;
  if (g === 'D') return 55;
  return 35; // F or others
}

function getGradeClass(grade) {
  const gradeUpper = (grade || '').toUpperCase();
  if (gradeUpper === 'A') return 'active';
  if (gradeUpper === 'B') return 'active';
  if (gradeUpper === 'C') return 'active';
  if (gradeUpper === 'D') return 'active';
  return 'inactive';
}

function generateCourseCode(courseName, index) {
  if (!courseName) return `ICT ${2000 + index}`;
  const words = String(courseName).split(' ');
  if (words.length >= 2) {
    return `${escapeHtml(words[0].substring(0, 3).toUpperCase())} ${2000 + index}`;
  }
  return `ICT ${2000 + index}`;
}

// Expose helpers to global scope for older browsers
window.escapeHtml = escapeHtml;
window.getGradeFromScore = getGradeFromScore;
window.getGradeClass = getGradeClass;
window.generateCourseCode = generateCourseCode;
window.getScoreFromGrade = getScoreFromGrade;
