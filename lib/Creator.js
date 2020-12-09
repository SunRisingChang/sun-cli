const download = require('download-git-repo');
const ora = require('ora');
const fs = require('fs-extra')
const shell = require('shelljs');
const handlebars = require("handlebars");

module.exports = class Creator {

    constructor(projectName, targetDir, tmpNameStr) {
        this.projectName = projectName
        this.targetDir = targetDir
        this.tmpName = tmpNameStr.split(":")[0]
        this.currTmpObj = require("../bin/tmp.config").find(item => item.name === this.tmpName)
    }

    async run() {
        try {
            await this.getTmpFiles()
            await this.checkFiles()
            await this.tmpFill()
            await this.install()
            ora('项目初始化完成！').succeed();
        } catch (error) {
            ora('项目初始化失败.').fail();
        } finally {
            process.exit(1)
        }
    }

    // 安装依赖
    install() {
        return new Promise(async (resolve, reject) => {
            // 环境检擦
            if (!shell.which('npm')) {
                ora('系统缺少 Node.js 环境，安装自动跳过.').fail()
                resolve()
            }
            if (!shell.which('git')) {
                ora('系统缺少 Git 环境，安装自动跳过.').fail()
                resolve()
            }
            const spinner = ora('依赖安装中...').start();
            shell.cd(this.projectName)
            shell.exec("npm install", {
                silent: true,
                async: false
            }, (code) => {
                if (code == 0) {
                    spinner.succeed("依赖安装完成!")
                    resolve()
                } else {
                    spinner.fail("依赖安装失败.")
                    reject()
                }
            })
            setTimeout(() => {
                spinner.fail("依赖安装超时，请手动安装依赖.")
                reject()
            }, 1000 * 60 * 3)
        })
    }

    // 模板填充
    tmpFill() {
        return new Promise((resolve) => {
            const spinner = ora('模板内容填充中...').start();
            const fileUrl = this.targetDir + "/package.json"
            let data = fs.readJsonSync(fileUrl)
            const templateSpec = handlebars.compile(JSON.stringify(data));
            const template = templateSpec({
                name: this.projectName
            })
            fs.outputJsonSync(fileUrl, JSON.parse(template), { spaces: 2 })
            spinner.succeed('模板内容填充成功！')
            resolve()
        })
    }

    // 检查文件完整度
    checkFiles() {
        return new Promise((resolve, reject) => {
            const spinner = ora('文件完整度检测中...').start();
            // 检测package.json是否存在
            if (fs.existsSync(this.targetDir + "/package.json")) {
                spinner.succeed('文件完整度检测成功！')
                resolve()
            } else {
                spinner.fail("文件完整度检测失败,缺少 package.json 文件.")
                reject()
            }
        })
    }

    // 拉取模板文件
    getTmpFiles() {
        return new Promise((resolve, reject) => {
            const spinner = ora('模板拉取中...').start();
            download("direct:" + this.currTmpObj.path, this.targetDir, { clone: true }, function (err) {
                if (err) {
                    spinner.fail("模板拉取失败.")
                } else {
                    spinner.succeed('模板拉取成功！')
                }
                err ? reject() : resolve()
            })
        })
    }

}