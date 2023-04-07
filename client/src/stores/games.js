import { defineStore } from 'pinia'
import { useGlobals } from '@/main'
import { useUserStore } from '@/stores/user'

export const useGamesStore = defineStore('games', {
    state: () => ({
        backlog: [],
        watchlist: [],
        played: []
    }),
    actions: {
        addToBacklog(gameInfo) {
            let index = this.watchlist.findIndex((value) => value.id === gameInfo.id)
            if (index > -1) {
                this.watchlist.splice(index, 1)
            }
            index = this.played.findIndex((value) => value.id === gameInfo.id)
            if (index > -1) {
                this.played.splice(index, 1)
            }
            this.backlog.push(gameInfo)
        },
        addToWatchlist(gameInfo) {
            let index = this.played.findIndex((value) => value.id === gameInfo.id)
            if (index > -1) {
                this.played.splice(index, 1)
            }
            index = this.backlog.findIndex((value) => value.id === gameInfo.id)
            if (index > -1) {
                this.backlog.splice(index, 1)
            }
            this.watchlist.push(gameInfo)
        },
        addToPlayed(gameInfo) {
            let index = this.watchlist.findIndex((value) => value.id === gameInfo.id)
            if (index > -1) {
                this.watchlist.splice(index, 1)
            }
            index = this.backlog.findIndex((value) => value.id === gameInfo.id)
            if (index > -1) {
                this.backlog.splice(index, 1)
            }
            this.played.push(gameInfo)
        },
        removeFromBacklog(gameInfo) {
            let index = this.backlog.findIndex((value) => value.id === gameInfo.id)
            if (index > -1) {
                this.backlog.splice(index, 1)
            }
        },
        removeFromWatchlist(gameInfo) {
            let index = this.watchlist.findIndex((value) => value.id === gameInfo.id)
            if (index > -1) {
                this.watchlist.splice(index, 1)
            }
        },
        removeFromPlayed(gameInfo) {
            let index = this.played.findIndex((value) => value.id === gameInfo.id)
            if (index > -1) {
                this.played.splice(index, 1)
            }
        },
        async fetchPlayed() {
            try {
                const { $axios } = useGlobals()
                const user = useUserStore()
                const played = await $axios.get(`/api/user/${user.user.id}/played`)
                this.played = played.data
            } catch (err) {
                console.log(err)
            }
        }
    }
})
