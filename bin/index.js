#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const package = require("../package.json")

program
    .version(package.version, "-v, --version", "输出版本号")
    .helpOption("-h, --help", "输出帮助信息")

program
    .command('new <project-name>')
    .description('新建初始项目')
    .action((projectName, cmd) => {
        require("./command/new")(projectName, cmd)
    })

program
    .command('list')
    .description('输出模板信息')
    .action(() => {
        require("./command/list")()
    })

// 添加属性帮助信息
program.on('--help', () => {
    console.log()
    console.log(`  运行 ${chalk.cyan(`${package.name} <command> --help`)} 输出命令的详细用法.`)
    console.log()
})

// 添加命令帮助信息
program.commands.forEach(c => c.on('--help', () => console.log()))

program.parse(process.argv)