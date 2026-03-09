import * as context from './testContext';

 
    /**
     * Logs informational messages to runtime logger and console.
     *
     * Details:
     * - Always writes to `testContext.logger.info`.
     * - Suppresses console output for messages containing `password`.
     *
     * @example
     * info("Navigated to dashboard page");
     */
  export function  info(msg: string) {
        context.testContext.logger.info(msg);
        if (!msg.toLowerCase().includes('password'))
            console.log(msg);
    }

     
    /**
     * Logs error messages to runtime logger and console.
     *
     * @example
     * error("Login API returned 500 response");
     */
      export function error(msg: string)  {
        context.testContext.logger.error(msg);
        console.log(msg);
    }
 
 

import { transports, format } from "winston";

/**
 * Builds Winston logger options for file transport.
 *
 * @param loggerOptions Log file naming and folder options.
 * @returns Winston transport configuration object.
 *
 * @example
 * const cfg = options({ fileName: "run_20260309", logfileFolder: "./logs" });
 */
function options(loggerOptions: { fileName: string, logfileFolder: string }) {
    return {
        transports: [
            new transports.File({
                filename: `${loggerOptions.logfileFolder}/${loggerOptions.fileName}.log`,
                level: 'info',
                format: format.combine(
                    format.timestamp({
                        format: 'YYYY-MM-DD HH:mm:ss'
                    }),
                    format.align(),
                    format.printf(info => `[${new Date().toLocaleString()}] : ${info.level}: ${info.message}`)
                )
            })
        ]
    }
}
