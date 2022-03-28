import { MergedConfig, ConfigObject, ConfigField, customFieldsFormat } from './interfaces';

export class Config {

    private config: MergedConfig = {
        "fields": [],
        "customFieldsFormat": "cloud-logging",
        "outputStartupMsg": false
    }

    constructor(...rest: ConfigObject[]) {
        this.addConfig(rest);
    }

    public getConfig(): ConfigObject {
        return this.config;
    }

    public getFields(fieldNames: string[]): ConfigField[] {

        if (fieldNames.length > 0) {
            let result: ConfigField[] = [];
            fieldNames.forEach(name => {
                let index = this.getIndex(name);
                let configField = this.config.fields[index];
                result.push(configField);
            });
            return result;
        }

        return this.config.fields!;
    }

    public getMsgFields(): ConfigField[] {
        const filtered = this.config.fields.filter(
            key => {
                return key.output?.includes('msg-log');
            }
        );
        return filtered;
    }

    public getReqFields(): ConfigField[] {
        const filtered = this.config.fields.filter(
            key => {
                return key.output?.includes("req-log")
            }
        );
        return filtered;
    }

    public getDeactivatedFields(): ConfigField[] {
        const filtered = this.config.fields.filter(
            key => {
                return key.deactivated === true
            }
        );
        return filtered;
    }

    public addConfig(configs: ConfigObject[]) {

        configs.forEach(file => {
            file.fields?.forEach(field => {

                let index = this.getIndex(field.name);

                // if new config field
                if (index === -1) {
                    this.config.fields.push(field);
                    return;
                }

                // replace object in array with new field
                this.config.fields.splice(index, 1, field);
            })

            if (file.outputStartupMsg != undefined) {
                this.config.outputStartupMsg = file.outputStartupMsg;
            }

            if (file.customFieldsFormat) {
                this.config.customFieldsFormat = file.customFieldsFormat;
            }
        });
    }

    public setCustomFieldsFormat(format: customFieldsFormat) {
        this.config.customFieldsFormat = format;
    }

    public setStartupMessageEnabled(enabled: boolean) {
        this.config.outputStartupMsg = enabled;
    }

    // get index of field in config
    private getIndex(name: string): number {

        let index = this.config.fields.findIndex(
            field => field.name == name
        );

        return index;
    }
}
