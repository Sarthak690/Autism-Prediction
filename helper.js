// utils/helpers.js (Backend - Your logic with safeguards)
function getRankLowerBound(rank, certainty) {
  const r = parseInt(rank);
  let result;
  
  if (certainty === 'confirm') {
    if (r < 500) return r - 20;
    if (r < 1000) return r - 100;
    if (r < 2000) return r - 150;
    if (r < 3000) return r - 250;
    if (r < 5000) return r - 350;
    if (r < 10000) return r - 500;
    if (r < 20000) return r - 750;
    else return r - 1000;
  } else {
    if (r < 500) return r - 150;
    if (r < 1000) return r - 300;
    if (r < 2000) return r - 500;
    if (r < 3000) return r - 700;
    if (r < 5000) return r - 1000;
    if (r < 10000) return r - 1500;
    if (r < 20000) return r - 2500;
    else return r - 3000;
  }
  
}

function getCutoffLowerBound(cutoff, certainty) {
  const c = parseFloat(cutoff);
  if (certainty === 'confirm') {
    if (c > 199.5) return c + 0.25;
    if (c > 198) return c + 0.3;
    if (c > 195) return c + 0.5;
    if (c > 190) return c + 0.75;
    if (c > 180) return c + 1.0;
    return c + 1.25;
  } else {
    if (c > 199.5) return c + 0.5;
    if (c > 198) return c + 0.75;
    if (c > 195) return c + 1.0;
    if (c > 190) return c + 1.5;
    if (c > 180) return c + 2.0;
    return c + 3.0;
  }
}

module.exports = { getRankLowerBound, getCutoffLowerBound };