class SyncObjectCommand {
    constructor(objectName) {
        this.objectName = typeof objectName === 'string' ? objectName : null;
    }

    execute(syncOptions) {
        const self = this;
        return new Promise(function (resolve, reject) {
            resolve(true);
            try {
                if (self.objectName !== null) {
                    const syncObject = new kony.sdk.KNYObj(self.objectName);
                    let options = syncOptions ? syncOptions : {};
                    options.getSyncStats = true;
                    options.syncType = 'downloadOnly';
                    const onSuccessSync = function (response) {
                        if (response.status === 0) {
                            resolve(response);
                        } else if (response.syncErrors) {
                            reject(response.syncErrors);
                        }
                    };

                    const operationError = function (error) {
                        reject(error);
                    };

                    syncObject.startSync(options, onSuccessSync, operationError);
                } else {
                    reject();
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

class CreateDataCommand {
    constructor(objectName) {
        this.objectName = typeof objectName === 'string' ? objectName : null;
    }

    execute(data, options) {
        const self = this;
        return new Promise(function (resolve, reject) {
            resolve(true);
            try {
                if (self.objectName !== null) {
                    const object = new kony.sdk.KNYObj(self.objectName);
                    data.LastUpdate = new Date().toISOString();
                    data.DeleteFlag = 0;
                    object.create(data, options, result => resolve(result), error => reject(error));        
                } else {
                    reject();
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

class WaitCommand {
    constructor(duration) {
        this.duration = duration;
    }

    execute() {
        const self = this;
        return new Promise(function(resolve, reject) {
            try {
                kony.timer.schedule("someTimer",()=>{
                    kony.print('WaitCommand:execute');
                    resolve(true);
                }, self.duration, false);
            } catch (error) {
                reject(error);
            }
        });
    }
}