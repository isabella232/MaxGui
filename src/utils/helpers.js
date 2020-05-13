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
import Vue from 'vue'

export const isNaN = require('lodash/isNaN')
export const isObject = require('lodash/isObject')
export const isEmpty = require('lodash/isEmpty')
export const isNull = require('lodash/isNull')
export const isFunction = require('lodash/isFunction')
export const cloneDeep = require('lodash/cloneDeep')
export const isUndefined = require('lodash/isUndefined')
export const pickBy = require('lodash/pickBy')
export const isBoolean = require('lodash/isBoolean')
export const pick = require('lodash/pick')
export const isEqual = require('lodash/isEqual')
export const xorWith = require('lodash/xorWith')
export const uniqueId = require('lodash/uniqueId')
export const orderBy = require('lodash/orderBy')

export function getCookie(name) {
    let value = '; ' + document.cookie
    let parts = value.split('; ' + name + '=')
    if (parts.length == 2)
        return parts
            .pop()
            .split(';')
            .shift()
}

export function range(start, end) {
    if (isNaN(start) || isNaN(end)) return
    return Math.floor(Math.random() * (end - start + 1)) + start
}

//------------------------- Helper functions to display icon -------------------------------
export function serviceStateIcon(serviceState) {
    if (serviceState) {
        if (serviceState.includes('Started')) return 2
        if (serviceState.includes('Stopped') || serviceState.includes('Allocated')) return 0
        else return ''
    } else return ''
}
export function serverStateIcon(serverStatus) {
    if (serverStatus) {
        if (serverStatus === 'Master, Running' || serverStatus === 'Slave, Running') return 2
        if (serverStatus === 'Running' || serverStatus.includes('Maintenance')) return 1
        if (serverStatus === 'Down') return 0
        else return ''
    } else return ''
}
export function monitorStateIcon(monitorState) {
    if (monitorState) {
        if (monitorState.includes('Running')) return 2
        if (monitorState.includes('Stopped')) return 1
        else return ''
    } else return ''
}

export function delay(t, v) {
    return new Promise(function(resolve) {
        setTimeout(resolve.bind(null, v), t)
    })
}

export function dynamicColors(dataIndex) {
    const palette = [
        'rgba(171,199,74,1)',
        'rgba(245,157,52,1)',
        'rgba(47,153,163,1)',
        'rgba(150,221,207,1)',
        'rgba(125,208,18,1)',
        'rgba(14,100,136,1)',
        'rgba(66,79,98,1)',
        'rgba(0,53,69,1)',
        'rgba(45,156,219,1)',
    ]
    return palette[dataIndex % palette.length]
}

export function strReplaceAt(str, index, chr) {
    if (index > str.length - 1) return str
    return str.substr(0, index) + chr + str.substr(index + 1)
}

/**
 * @param {Object} error Error object that returns from try catch
 * @return {Array} An array of error string
 */
export function getErrorsArr(error) {
    let errorsArr = [error]
    !isUndefined(error.response.data.errors) &&
        (errorsArr = error.response.data.errors.map(ele => `${ele.detail}`))
    return errorsArr
}

/**
 * @param {Array} OurArray Array of objects to be grouped by specified property name of object
 * @param {String} property Property to be grouped by
 * @return {Array} Return an object group by specified property name
 */
export function groupBy(array, property) {
    return array.reduce(function(accumulator, object) {
        // get the value of our object based on provided property to use for group the array as the array key
        const key = object[property]
        /*  if the current value is similar to the key don't accumulate the transformed array and leave it empty */
        if (!accumulator[key]) {
            accumulator[key] = []
        }
        // add the value to the array
        accumulator[key].push(object)
        // return the transformed array
        return accumulator
        // Also we also set the initial value of reduce() to an empty object
    }, {})
}

/**
 * @param {String} str String to be sliced
 * @param {String} char find the indexOf provided char
 * @param {Boolean} returnLastPart if true, slice the last part
 * @return {String} new String
 */
export function sliceStrAtChar(str, char, returnLastPart) {
    return returnLastPart
        ? str.slice(str.indexOf(char) + 1, str.indexOf(str.slice(-1)) + 1)
        : str.slice(0, str.indexOf(char))
}

/**
 * @param {String} str String to be sliced, use for resource name
 * @return {String} new return singular string
 */
export function pluralToSingularStr(str) {
    return str.slice(0, str.lastIndexOf('s'))
}
/**
 * @param {String} value String date to be formatted
 * @param {String} formatType format type
 * @return {String} new String with HH:mm:ss MM/DD/YYYY format
 */
export function formatValue(value, formatType) {
    let date = new Date(value)
    const DATE_RFC2822 = 'ddd, DD MMM YYYY HH:mm:ss'
    const default_format = 'HH:mm:ss MM.DD.YYYY'
    let format
    switch (formatType) {
        case 'DATE_RFC2822':
            format = DATE_RFC2822
            break
        default:
            format = default_format
    }

    return Vue.moment(date).format(format)
}

/**
 * @param {Object} obj Object to be converted to array
 * @param {String} keyName keyName
 * @param {String} keyValue keyValue
 * @param {Boolean} keepPrimitiveValue keepPrimitiveValue to whether call handleValue function or not
 * @return {Array}  an array of objects with format like this {id: key, value: obj[key]}
 */
export function objToArrOfObj(obj, keepPrimitiveValue, level, keyName = 'id', keyValue = 'value') {
    const isValidObj = obj !== null && typeof obj === 'object'
    if (isValidObj) {
        let data = []
        let targetObj = cloneDeep(obj)

        if (!isEmpty(targetObj)) {
            Object.keys(targetObj).map(key => {
                let value = keepPrimitiveValue ? targetObj[key] : handleValue(targetObj[key])

                let newObj = {
                    [keyName]: key,
                    [keyValue]: value,
                }

                if (level !== undefined) {
                    newObj.level = level
                    /* width of one v-treeview-node__level is 24, by default
                     */
                    newObj.colNameWidth = `calc(65% - 11px -  ${(level + 1) * 8.5}px)`
                    newObj.colValueWidth = `calc(35% - 11px - ${(level + 1) * 8.5}px)`
                }
                const hasChild =
                    (value !== null && typeof value === 'object') || Array.isArray(value)
                let children = []

                if (hasChild) {
                    // assigning original value to originalValue in order let arrOfObjToObj reverse back to obj
                    newObj.originalValue = value
                    newObj[keyValue] = null
                    children = objToArrOfObj(value, keepPrimitiveValue, level + 1)
                }
                if (Array.isArray(value)) {
                    // convert to object
                    children = objToArrOfObj({ ...value }, keepPrimitiveValue, level + 1)
                }
                newObj.children = children
                newObj.isLeaf = !hasChild
                data.push(newObj)
            })
            return data
        }
    }
    return []
}

/**
 * @param {Array} a Array of object to be converted to object
 * @param {String} keyName keyName
 * @param {String} keyValue keyValue
 * @return {Object}  return original object of the objToArrOfObj function
 */
export function arrOfObjToObj(a, keyName = 'id', keyValue = 'value') {
    if (Array.isArray(a)) {
        let array = cloneDeep(a)
        let o = {}
        for (let i = 0; i < array.length; ++i) {
            let innerObj = array[i]
            if (!isEmpty(innerObj)) {
                /* the value needs to be handled, convert from 'null' or '' to 
                the actual null object */
                if (!innerObj.isLeaf) {
                    o[innerObj[keyName]] = innerObj.originalValue
                } else o[innerObj[keyName]] = innerObj[keyValue]
            }
        }
        return o
    }
    return {}
}

/**
 * @param {Any} value Object to be converted to array
 * @return {Any} return valid value, null becomes 'null', '' becomes "''", otherwise return 'undefined'
 */
export function handleValue(value) {
    let typeOfValue = typeof value
    let newVal

    if (
        Array.isArray(value) ||
        typeOfValue === 'object' ||
        typeOfValue === 'string' ||
        typeOfValue === 'number' ||
        typeOfValue === 'boolean'
    ) {
        newVal = value
    } else {
        newVal = 'undefined'
    }
    // handle typeof null object and empty string
    if (value === null) newVal = 'null'

    return newVal
}

Object.defineProperties(Vue.prototype, {
    $help: {
        get() {
            return {
                getCookie,
                range,
                serviceStateIcon,
                serverStateIcon,
                monitorStateIcon,

                delay,
                dynamicColors,
                strReplaceAt,
                getErrorsArr,
                groupBy,
                sliceStrAtChar,
                formatValue,
                objToArrOfObj,
                arrOfObjToObj,
                handleValue,
                pluralToSingularStr,
                // arrayObjDeepCompare,
                // lodash
                isNaN,
                isObject,
                isEmpty,
                isNull,
                isFunction,
                cloneDeep,
                isUndefined,
                pickBy,
                pick,
                isBoolean,
                isEqual,
                xorWith,
                uniqueId,
                orderBy,
            }
        },
    },
})
