class SyncObjectCommand {
    constructor(objectName) {
        this.objectName = typeof objectName === 'string' ? objectName : null;
    }

    execute(syncOptions) {
        return new Promise(function (resolve, reject) {
            resolve(true);
        });
    }
}

class CreateDataCommand {
    constructor(objectName) {
        this.objectName = typeof objectName === 'string' ? objectName : null;
    }

    execute(data, options) {
        return new Promise(function (resolve, reject) {
            resolve(true);
        });
    }
}

class GetDataCommand {
    constructor(objectName) {
        this.objectName = objectName;
    }

    execute() {
        return new Promise(function(resolve, reject) {
            try {
                kony.timer.schedule("someTimer:GetDataCommand",()=>{
                    kony.print('GetDataCommand:execute');
                    const data = {
                        BoroughId: '11ACG',
                        Borough: 'some name',
                        DeleteFlag: 0,
                        LastUpdate: "2021-01-28T16:56:23.505Z"
                    };
                    resolve(data);
                }, 5, false);
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
                kony.timer.schedule("someTimer:WaitCommand",()=>{
                    kony.print('WaitCommand:execute');
                    resolve(true);
                }, self.duration, false);
            } catch (error) {
                reject(error);
            }
        });
    }
}