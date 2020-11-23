const moment = require("moment");
const YEAR_AD = 543;

const methods = {
  toDate({ _d, locale = "en", isShortness = false } = {}) {
    if (!_d) return "";
    let format = isShortness ? "DD MMM YYYY" : "DD MMMM YYYY";
    try {
      switch (locale.toLowerCase()) {
        case "th":
          moment.locale("th");
          return moment(_d).add(YEAR_AD, "years").format(format);
        default:
          moment.locale("en");
          return moment(_d).format(format);
      }
    } catch (error) {
      return "";
    }
  },

  toDateTime({ _d, locale = "en", isShortness = false } = {}) {
    if (!_d) return "";
    let format = isShortness ? "DD MMM YYYY HH:mm" : "DD MMMM YYYY HH:mm";
    try {
      switch (locale.toLowerCase()) {
        case "th":
          moment.locale("th");
          return moment(_d).add(YEAR_AD, "years").format(format);
        default:
          moment.locale("en");
          return moment(_d).format(format);
      }
    } catch (error) {
      return "";
    }
  },

  caclulateTokenExp(exp, type) {
    const today = new Date();
    const newDate = new Date();
    switch (type) {
      case "days":
        return newDate.setDate(today.getDate() + parseInt(exp));
      case "hourse":
        return newDate.setHours(today.getHours() + parseInt(exp));
      case "minutes":
        return newDate.setMinutes(today.getMinutes() + parseInt(exp));
      default:
        newDate.setMinutes(today.getMinutes() + parseInt(exp));
    }
  },
};

module.exports = { ...methods };
