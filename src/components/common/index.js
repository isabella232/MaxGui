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
import BaseDialog from './BaseDialog'
import DataTable from './DataTable'
import SearchBox from './SearchBox'
import DetailsPageTitle from './DetailsPageTitle'
import IconSpriteSheet from './IconSpriteSheet'
import OutlinedOverviewCard from './OutlinedOverviewCard'
import TreeData from './TreeData'
import Collapse from './Collapse'
import IconGroupWrapper from './IconGroupWrapper'
import ConfirmDialog from './ConfirmDialog'
import SelectDialog from './SelectDialog'
import ParameterInput from './ParameterInput'
import LineChart from './LineChart.vue'

export default {
    'base-dialog': BaseDialog,
    'data-table': DataTable,
    'search-box': SearchBox,
    'details-page-title': DetailsPageTitle,
    'icon-sprite-sheet': IconSpriteSheet,
    'outlined-overview-card': OutlinedOverviewCard,
    'tree-data': TreeData,
    collapse: Collapse,
    'icon-group-wrapper': IconGroupWrapper,
    'confirm-dialog': ConfirmDialog,
    'select-dialog': SelectDialog,
    'parameter-input': ParameterInput,
    'line-chart': LineChart,
}
