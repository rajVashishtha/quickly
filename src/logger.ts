import chalk from "chalk";

export class Logger {
  constructor(private verbose: boolean) {}

  info(msg: string) {
    console.log(chalk.cyan(msg));
  }

  success(msg: string) {
    console.log(chalk.green(msg));
  }

  warn(msg: string) {
    console.log(chalk.yellow(msg));
  }

  error(msg: string) {
    console.log(chalk.red(msg));
  }

  debug(msg: string) {
    if (this.verbose) {
      console.log(chalk.gray("[debug] " + msg));
    }
  }
}
