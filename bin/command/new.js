/**
 * @Author: Sun Rising 
 * @Date: 2020-12-08 09:46:49 
 * @Last Modified by: Sun Rising
 * @Last Modified time: 2020-12-08 13:48:08
 * @Description: 新建初始项目
 */
const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const validateProjectName = require('validate-npm-package-name')
const Creator = require("../../lib/Creator")

async function newProject(projectName, cmd) {

    const cwd = cmd.options.cwd || process.cwd() // 当前目录
    const inCurrent = projectName === '.' // 是否在当前目录
    const name = inCurrent ? path.relative('../', cwd) : projectName // 项目名称
    const targetDir = path.resolve(cwd, projectName || '.') // 生成项目的目录

    const result = validateProjectName(name)

    if (!result.validForNewPackages) {
        console.error(chalk.red(`非法的项目名称: "${name}"`))
        result.errors && result.errors.forEach(err => {
            console.error(chalk.red.dim('Error: ' + err))
        })
        result.warnings && result.warnings.forEach(warn => {
            console.error(chalk.red.dim('Warning: ' + warn))
        })
        process.exit(1)
    }

    if (fs.existsSync(targetDir)) {
        const { ok } = await inquirer.prompt([
            {
                name: 'ok',
                type: 'confirm',
                message: `当前路径下已经存在 ${projectName} 文件夹，是否继续创建?`
            }
        ])
        if (!ok) process.exit(1)
        await fs.remove(targetDir)
    }

    const { tmpName } = await inquirer.prompt([
        {
            name: 'tmpName',
            type: 'list',
            message: `选择使用的模板`,
            choices: require("../tmp.config").map(item => `${item.name}:${item.description}`)
        }
    ])

    new Creator(projectName, targetDir, tmpName).run()

}

module.exports = (...args) => {
    return newProject(...args).catch(err => {
        console.log("项目创建失败");
        console.error(err);
        process.exit(1)
    })
}