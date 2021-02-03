//!! don't return errors in resolve() only reject()
class SyncObjectCommand {
    constructor(duration) {
        this.duration = duration;
    }

    execute() {
        const self = this;
        return new Promise(function (resolve, reject) {
            kony.timer.schedule("SyncObjectCommand:timer",()=>{
                kony.print('SyncObjectCommand:execute');
                resolve(true);
            }, self.duration, false);
        });
    }
}

class CreateDataCommand {
    constructor(duration) {
        this.duration = duration;
    }

    execute() {
        const self = this;
        return new Promise(function (resolve, reject) {
            kony.timer.schedule("CreateDataCommand:timer",()=>{
                kony.print('CreateDataCommand:execute');
                resolve(true);
            }, self.duration, false);
        });
    }
}

class GetDataCommand {
    constructor(duration) {
        this.duration = duration;
    }

    execute() {
        const self = this;
        return new Promise(function(resolve, reject) {
            try {
                kony.timer.schedule("GetDataCommand:timer",()=>{
                    kony.print('GetDataCommand:execute');
                    const data = {
                        BoroughId: '11ACG',
                        Borough: 'some name',
                        DeleteFlag: 0,
                        LastUpdate: "2021-01-28T16:56:23.505Z"
                    };
                    resolve(data);
                }, self.duration, false);
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
                kony.timer.schedule("WaitCommand:timer",()=>{
                    kony.print('WaitCommand:execute');
                    resolve(true);
                }, self.duration, false);
            } catch (error) {
                reject(error);
            }
        });
    }
}
