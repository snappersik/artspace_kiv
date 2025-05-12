import ApiStore from './ApiStore';

class RootStore {
  constructor() {
    this.apiStore = ApiStore;
  }
}

const rootStore = new RootStore();
export default rootStore;
