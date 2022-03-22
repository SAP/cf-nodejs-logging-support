import { MergedConfigFile, ConfigFile, ConfigField, customFieldsFormat } from '../interfaces';

export class Config {

    private configFile: MergedConfigFile = {
        "fields": [],
        "customFieldsFormat": "application-logging",
        "outputStartupMsg": false
    }

    constructor(...rest: ConfigFile[]) {
        this.addConfig(rest);
    }

    public getConfig(): ConfigFile {
        return this.configFile;
    }

    public getFields(fieldNames: string[]): ConfigField[] {

        if (fieldNames.length > 0) {
            let result: ConfigField[] = [];
            fieldNames.forEach(name => {
                let index = this.getIndex(name);
                let configField = this.configFile.fields[index];
                result.push(configField);
            });
            return result;
        }

        return this.configFile.fields!;
    }

    public getCoreFields(): ConfigField[] {
        const filtered = this.configFile.fields.filter(
            key => {
                return key.output?.includes('log');
            }
        );
        return filtered;
    }

    public getReqFields(): ConfigField[] {
        const filtered = this.configFile.fields.filter(
            key => {
                return key.output?.includes("req-log")
            }
        );
        return filtered;
    }

    public getDeactivatedFields(): ConfigField[] {
        const filtered = this.configFile.fields.filter(
            key => {
                return key.deactivated === true
            }
        );
        return filtered;
    }

    public addConfig(configs: ConfigFile[]) {

        configs.forEach(file => {
            file.fields?.forEach(field => {

                let index = this.getIndex(field.name);

                // if new config field
                if (index === -1) {
                    this.configFile.fields.push(field);
                    return;
                }

                // replace object in array with new field
                this.configFile.fields.splice(index, 1, field);
            })

            if (file.outputStartupMsg != undefined) {
                this.configFile.outputStartupMsg = file.outputStartupMsg;
            }

            if (file.customFieldsFormat) {
                this.configFile.customFieldsFormat = file.customFieldsFormat;
            }
        });
    }

    public setFormat(format: customFieldsFormat) {
        this.configFile.customFieldsFormat = format;
    }

    public activateStartupMessage() {
        this.configFile.outputStartupMsg = true;
    }

    public deactivateStartupMessage() {
        this.configFile.outputStartupMsg = false;
    }

    // get index of field in config
    private getIndex(name: string): number {

        let index = this.configFile.fields.findIndex(
            field => field.name == name
        );

        return index;
    }
}
