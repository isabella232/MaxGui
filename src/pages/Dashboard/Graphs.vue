<template>
    <v-row style="margin-right:-8px;margin-left:-8px">
        <v-col cols="4" style="padding:0px 8px">
            <outline-small-card cardWrapper="slide-nav-item" cardClass="slide-nav-item__card-graph">
                <template v-slot:title>
                    {{ $t('sessions') }}
                </template>
                <template v-slot:card-body>
                    <line-chart
                        v-if="sessionsChartData.datasets.length"
                        id="sessions-Chart"
                        ref="sessionsChart"
                        :styles="{ height: '70px' }"
                        :chart-data="sessionsChartData"
                        :options="chartOptionsWithOutCallBack"
                        :isRealTime="true"
                    />
                </template>
            </outline-small-card>
        </v-col>
        <v-col cols="4" style="padding:0px 8px">
            <outline-small-card cardWrapper="slide-nav-item" cardClass="slide-nav-item__card-graph">
                <template v-slot:title>
                    {{ $t('connections') }}
                </template>
                <template v-if="allServers.length" v-slot:card-body>
                    <line-chart
                        v-if="serversConnectionsChartData.datasets.length"
                        id="servers-connection-Chart"
                        ref="connectionsChart"
                        :styles="{ height: '70px' }"
                        :chart-data="serversConnectionsChartData"
                        :options="mainChartOptions"
                        :isRealTime="true"
                    />
                </template>
            </outline-small-card>
        </v-col>
        <v-col cols="4" style="padding:0px 8px">
            <outline-small-card cardWrapper="slide-nav-item" cardClass="slide-nav-item__card-graph">
                <template v-slot:title>
                    {{ $t('load') }}
                </template>
                <template v-slot:card-body>
                    <!-- <threads-chart :isMiniChart="true" /> -->
                    <line-chart
                        v-if="threadsChartData.datasets.length"
                        id="threads-Chart"
                        ref="threadsChart"
                        :styles="{ height: '70px' }"
                        :chart-data="threadsChartData"
                        :options="threadChartOptions"
                        :isRealTime="true"
                        :yAxesTicks="{ max: 100, min: 0 }"
                    />
                </template>
            </outline-small-card>
        </v-col>
    </v-row>
</template>

<script>
/*
 * Copyright (c) 2020 MariaDB Corporation Ab
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file and at www.mariadb.com/bsl11.
 *
 * Change Date: 2024-07-01
 *
 * On the date above, in accordance with the Business Source License, use
 * of this software will be governed by version 2 or later of the General
 * Public License.
 */
import { mapGetters } from 'vuex'

export default {
    props: {
        fetchThreads: { type: Function, required: true },
        genThreadsDatasetsSchema: { type: Function, required: true },
        fetchAllServers: { type: Function, required: true },
        fetchAllSessions: { type: Function, required: true },
        fetchAllServices: { type: Function, required: true },
    },
    data() {
        return {
            threadChartOptions: {
                plugins: {
                    streaming: {
                        duration: 20000,
                        refresh: 1000, // onRefresh callback will be called every 5000 ms
                        // delay of 5000 ms, so upcoming values are known before plotting a line
                        delay: 5000,
                        onRefresh: this.updateThreadsChart,
                    },
                },
            },
            chartOptionsWithOutCallBack: {
                plugins: {
                    streaming: {
                        duration: 20000,
                        refresh: 10000,
                        delay: 10000,
                    },
                },
            },
            mainChartOptions: {
                plugins: {
                    streaming: {
                        duration: 20000,
                        refresh: 10000,
                        delay: 10000,

                        /*  delay of 10000 ms, so upcoming values are known before plotting a line
                            delay value can be larger but not smaller than refresh value to
                            remain realtime streaming data.
                            this onRefresh callback will be called every 
                            10000 ms to update connections and sessions chart
                        */

                        onRefresh: this.updateSessionsConnectionsChart,
                    },
                },
            },
        }
    },
    computed: {
        ...mapGetters({
            maxScaleOverviewInfo: 'maxscale/maxScaleOverviewInfo',
            threads: 'maxscale/threads',
            threadsChartData: 'maxscale/threadsChartData',
            allSessions: 'session/allSessions',
            sessionsChartData: 'session/sessionsChartData',
            allServers: 'server/allServers',
            serversConnectionsChartData: 'server/serversConnectionsChartData',
        }),
    },

    methods: {
        //----------------------- Graphs update
        async updateThreadsChart(chart) {
            let self = this
            await self.fetchThreads()

            await self.threads.forEach((thread, i) => {
                if (self.$help.isUndefined(chart.data.datasets[i])) {
                    self.genThreadsDatasetsSchema()
                } else {
                    chart.data.datasets[i].data.push({
                        x: Date.now(),
                        y: thread.attributes.stats.load.last_second,
                    })
                }
            })
            chart.update({
                preservation: true,
            })
        },

        async updateSessionsConnectionsChart() {
            let self = this
            //  LOOP polling
            await Promise.all([
                self.fetchAllServers(),
                self.fetchAllSessions(),
                self.fetchAllServices(),
            ])

            const { sessionsChart, connectionsChart } = self.$refs
            const time = Date.now()
            //-------------------- update connections chart

            let gap = self.allServers.length - connectionsChart.chartData.datasets.length

            self.allServers.forEach((server, i) => {
                if (gap > 0 && i > connectionsChart.chartData.datasets.length - 1) {
                    let lineColors = self.$help.dynamicColors(i)
                    let indexOfOpacity = lineColors.lastIndexOf(')') - 1
                    let dataset = {
                        label: `Server ID - ${server.id}`,
                        id: `Server ID - ${server.id}`,
                        type: 'line',
                        // background of the line
                        backgroundColor: self.$help.strReplaceAt(lineColors, indexOfOpacity, '0.2'),
                        borderColor: lineColors, //theme.palette.primary.main, // line color
                        borderWidth: 1,
                        lineTension: 0,
                        data: [
                            {
                                x: time,
                                y: server.attributes.statistics.connections,
                            },
                        ],
                    }

                    connectionsChart.chartData.datasets.push(dataset)
                } else {
                    connectionsChart.chartData.datasets[i].data.push({
                        x: time,
                        y: server.attributes.statistics.connections,
                    })
                }
                connectionsChart.$data._chart.update({
                    preservation: true,
                })
            })

            // ------------------------- update sessions chart

            sessionsChart.chartData.datasets.forEach(function(dataset) {
                dataset.data.push({
                    x: time,
                    y: self.allSessions.length,
                })
            })
            sessionsChart.$data._chart.update({
                preservation: true,
            })
        },
    },
}
</script>