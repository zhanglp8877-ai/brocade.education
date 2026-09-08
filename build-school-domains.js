const fs = require('fs');
const path = require('path');

const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error('Usage: node scripts/build-school-domains.js /path/to/world_universities_and_domains.json');
  process.exit(1);
}

const root = path.join(__dirname, '..');
const schools = JSON.parse(fs.readFileSync(path.join(root, 'public', 'qs2026.json'), 'utf8'));
const directory = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const stopWords = new Set(['the', 'of', 'and', 'at', 'in', 'for', 'university', 'universidad', 'universite', 'universita', 'college']);
const countryAliases = {
  '中国内地': ['China'], '中国台湾': ['Taiwan'], '中国香港': ['Hong Kong'], '中国澳门': ['Macao'],
  '美国': ['United States'], '英国': ['United Kingdom'], '加拿大': ['Canada'], '澳大利亚': ['Australia'],
  '新西兰': ['New Zealand'], '新加坡': ['Singapore'], '马来西亚': ['Malaysia'], '印度': ['India'],
  '日本': ['Japan'], '韩国': ['Korea, Republic of', 'South Korea'], '泰国': ['Thailand'], '越南': ['Viet Nam', 'Vietnam'],
  '印度尼西亚': ['Indonesia'], '菲律宾': ['Philippines'], '文莱': ['Brunei'], '斯里兰卡': ['Sri Lanka'],
  '孟加拉国': ['Bangladesh'], '巴基斯坦': ['Pakistan'], '哈萨克斯坦': ['Kazakhstan'], '乌兹别克斯坦': ['Uzbekistan'],
  '吉尔吉斯斯坦': ['Kyrgyzstan'], '俄罗斯': ['Russian Federation', 'Russia'], '乌克兰': ['Ukraine'], '格鲁吉亚': ['Georgia'],
  '亚美尼亚': ['Armenia'], '阿塞拜疆': ['Azerbaijan'], '土耳其': ['Turkey', 'Türkiye'], '以色列': ['Israel'],
  '阿联酋': ['United Arab Emirates'], '沙特阿拉伯': ['Saudi Arabia'], '卡塔尔': ['Qatar'], '科威特': ['Kuwait'],
  '巴林': ['Bahrain'], '阿曼': ['Oman'], '约旦': ['Jordan'], '黎巴嫩': ['Lebanon'], '伊朗': ['Iran'],
  '伊拉克': ['Iraq'], '叙利亚': ['Syrian Arab Republic', 'Syria'], '巴勒斯坦': ['Palestine'],
  '埃及': ['Egypt'], '南非': ['South Africa'], '摩洛哥': ['Morocco'], '突尼斯': ['Tunisia'],
  '埃塞俄比亚': ['Ethiopia'], '肯尼亚': ['Kenya'], '乌干达': ['Uganda'], '加纳': ['Ghana'],
  '尼日利亚': ['Nigeria'], '苏丹': ['Sudan'], '利比亚': ['Libya'],
  '德国': ['Germany'], '法国': ['France'], '意大利': ['Italy'], '西班牙': ['Spain'], '葡萄牙': ['Portugal'],
  '荷兰': ['Netherlands'], '比利时': ['Belgium'], '瑞士': ['Switzerland'], '奥地利': ['Austria'],
  '瑞典': ['Sweden'], '挪威': ['Norway'], '芬兰': ['Finland'], '丹麦': ['Denmark'], '冰岛': ['Iceland'],
  '爱尔兰': ['Ireland'], '波兰': ['Poland'], '捷克': ['Czech Republic', 'Czechia'], '斯洛伐克': ['Slovakia'],
  '匈牙利': ['Hungary'], '罗马尼亚': ['Romania'], '保加利亚': ['Bulgaria'], '希腊': ['Greece'],
  '克罗地亚': ['Croatia'], '塞尔维亚': ['Serbia'], '斯洛文尼亚': ['Slovenia'],
  '波黑': ['Bosnia and Herzegovina'], '塞浦路斯': ['Cyprus'], '马耳他': ['Malta'],
  '爱沙尼亚': ['Estonia'], '拉脱维亚': ['Latvia'], '立陶宛': ['Lithuania'], '卢森堡': ['Luxembourg'],
  '墨西哥': ['Mexico'], '巴西': ['Brazil'], '阿根廷': ['Argentina'], '智利': ['Chile'],
  '哥伦比亚': ['Colombia'], '秘鲁': ['Peru'], '厄瓜多尔': ['Ecuador'], '委内瑞拉': ['Venezuela'],
  '乌拉圭': ['Uruguay'], '巴拉圭': ['Paraguay'], '玻利维亚': ['Bolivia'],
  '哥斯达黎加': ['Costa Rica'], '危地马拉': ['Guatemala'], '洪都拉斯': ['Honduras'],
  '巴拿马': ['Panama'], '古巴': ['Cuba'], '多米尼加': ['Dominican Republic'], '波多黎各': ['Puerto Rico']
};

function normalize(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/&/g, ' and ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokens(value) {
  return normalize(value).split(' ').filter(token => token && !stopWords.has(token));
}

function canonical(value) {
  return normalize(value).split(' ').filter(token => token !== 'the').join(' ');
}

function similarity(left, right) {
  const a = new Set(tokens(left));
  const b = new Set(tokens(right));
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap += 1;
  return (2 * overlap) / (a.size + b.size);
}

const manualDomains = {
  'Massachusetts Institute of Technology (MIT)': 'mit.edu',
  'Imperial College London': 'imperial.ac.uk',
  'Stanford University': 'stanford.edu',
  'University of Oxford': 'ox.ac.uk',
  'Harvard University': 'harvard.edu',
  'University of Cambridge': 'cam.ac.uk',
  'ETH Zurich (Swiss Federal Institute of Technology)': 'ethz.ch',
  'National University of Singapore (NUS)': 'nus.edu.sg',
  'UCL (University College London)': 'ucl.ac.uk',
  'California Institute of Technology (Caltech)': 'caltech.edu',
  'The University of Hong Kong': 'hku.hk',
  'Nanyang Technological University, Singapore (NTU Singapore)': 'ntu.edu.sg',
  'University of Chicago': 'uchicago.edu',
  'Peking University': 'pku.edu.cn',
  'University of Pennsylvania': 'upenn.edu',
  'Cornell University': 'cornell.edu',
  'University of California, Berkeley (UCB)': 'berkeley.edu',
  'Tsinghua University': 'tsinghua.edu.cn',
  'The University of Melbourne': 'unimelb.edu.au',
  'The University of New South Wales': 'unsw.edu.au'
};

const output = {};
for (const school of schools) {
  const manual = manualDomains[school.en];
  if (manual) {
    output[school.id] = { domain: manual, match: 'verified' };
    continue;
  }
  const acceptedCountries = countryAliases[school.country] || [school.country];
  const candidates = directory.filter(item => acceptedCountries.includes(item.country));
  let best = null;
  for (const candidate of candidates) {
    const exact = canonical(candidate.name) === canonical(school.en);
    const score = exact ? 2 : similarity(candidate.name, school.en);
    if (!best || score > best.score) best = { candidate, score, exact };
  }
  const enoughDistinctiveTokens = new Set(tokens(school.en)).size >= 2 && new Set(tokens(best?.candidate.name)).size >= 2;
  if (best && (best.exact || (enoughDistinctiveTokens && best.score >= 0.86)) && best.candidate.domains?.[0]) {
    output[school.id] = {
      domain: best.candidate.domains[0],
      match: best.exact ? 'exact' : 'fuzzy'
    };
  }
}

const outputPath = path.join(root, 'public', 'school-domains.json');
fs.writeFileSync(outputPath, JSON.stringify(output));
console.log(`Matched ${Object.keys(output).length} of ${schools.length} schools -> ${outputPath}`);
