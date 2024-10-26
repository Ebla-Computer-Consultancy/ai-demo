import { getState, patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { effect } from "@angular/core";

type AppStore = {
    backgroundColor: string,
    backgroundUrl: string,
    logoUrl: string
    isVideo: boolean
    preview: boolean
}

const initialState: AppStore = {
    backgroundColor: '#8A1538',
    backgroundUrl: 'assets/images/background.svg',
    logoUrl: 'assets/images/qrep-newlogo-colored.png',
    isVideo: false,
    preview: false
}

export const AppStore = signalStore({
        providedIn: "root",
        protectedState: true
    }, withState(initialState),
    withMethods((store) => {
        return {
            updateState(state: AppStore) {
                patchState(store, state);
            }
        }
    }), withHooks((store) => {
        const storageState = localStorage.getItem('CURRENT_STATE')
        if (storageState) {
            patchState(store, JSON.parse(storageState));
        } else {
            const state = getState(store)
            localStorage.setItem('CURRENT_STATE', JSON.stringify(state));
        }
        return {
            onInit() {
                effect(() => {
                    const state = getState(store)
                    localStorage.setItem('CURRENT_STATE', JSON.stringify(state));
                })
            }
        }
    }))

