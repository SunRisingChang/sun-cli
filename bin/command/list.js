/**
 * @Author: Sun Rising 
 * @Date: 2020-12-08 09:45:40 
 * @Last Modified by: Sun Rising
 * @Last Modified time: 2020-12-08 10:58:51
 * @Description: 输出模板信息表格
 */
module.exports = () => {
    console.log();
    console.table(require("../tmp.config"));
    console.log();
}