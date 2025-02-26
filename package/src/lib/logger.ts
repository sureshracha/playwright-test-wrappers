import * as context from './testContext';

 
  export function  info(msg: string) {
        context.testContext.logger.info(msg);
        if (!msg.toLowerCase().includes('password'))
            console.log(msg);
    }

     
      export function error(msg: string)  {
        context.testContext.logger.error(msg);
        console.log(msg);
    }
 
 

import { transports, format } from "winston";

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
