import Dexie from 'dexie';

export default class DbService {
	
	db = new Dexie('jgen_db');

	constructor() {
		this.db.version(1)
			.stores({
				settings: 'id++,name,value,propertyName'
			});

		let settings = this.db.settings;

		settings.count().then(settingsRecords => {
			if(settingsRecords === 0) {
				settings.bulkAdd([
					{name: 'Base package', value: 'my.package', propertyName: 'basePackage'},
					{name: 'Controllers package name', value: 'controller', propertyName: 'controllersPackageName'},
					{name: 'Services package name', value: 'service', propertyName: 'servicesPackageName'},
					{name: 'Forms package name', value: 'form', propertyName: 'formsPackageName'}
				]);
			}
		});
	}

	async getSettings() {
		return await this.db.settings.toArray();
	}

	async getSetting(key) {
		let p = await this.db.settings.where({propertyName: key})
		return await p.first(s => s.value);
	}

	async setSettings(settings) {
		return await this.db.settings
						.bulkPut(settings);
	}
}