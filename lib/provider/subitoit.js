import utils from '../utils.js';
let appliedBlackList = [];
function normalize(o) {
  return o;
}
function applyBlacklist(o) {
  return !utils.isOneOf(o.title, appliedBlackList);
}
const config = {
  url: null,
  crawlContainer: '.BigCard-module_picture-group__0-nQc',
  sortByDateParam: null,
  crawlFields: {
    id: '@id',
    title: 'h2.index-module_sbt-text-atom__ed5J9 | removeNewline | trim',
    link: 'h2.BigCard-module_link__kVqPE@href',
    address: null,
    price: '.index-module_price__N7M2x index-module_small__4SyUf',
  },
  paginate: '.numbered-pager__bottom .numbered-pager--info li:nth-child(2) a@href',
  normalize: normalize,
  filter: applyBlacklist,
};
export const init = (sourceConfig, blacklist) => {
  config.enabled = sourceConfig.enabled;
  config.url = sourceConfig.url;
  appliedBlackList = blacklist || [];
};
export const metaInformation = {
  name: 'Subito.it',
  baseUrl: 'https://www.subito.it/',
  id: 'subitoit',
};
export { config };
