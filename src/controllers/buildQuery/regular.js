import {qNonEmpty} from "../../utils/q";
import Errors from "../../constants/Errors";
import agent from '../../utils/agents'

const getUpdateParams = (updateList, fieldNameArray, key = '') => {
  const firstFieldNameStringArray = fieldNameArray.map(i =>
    `${i.name}=c.${i.name}`)
  const firstFieldNameString = firstFieldNameStringArray.join(', ')
  const secondFieldNameString = fieldNameArray.join(', ')
  const { placeHoldersString,
    paramsArray} = getInsertParams(updateList, fieldNameArray, key)
  return {
    firstFieldNameString,
    secondFieldNameString,
    placeHoldersString,
    paramsArray
  }
}

const getInsertParams = (createList, fieldNameArray, key = '') => {
  let  placeHoldersString = ''
  let placeHoldersStringArray = []
  const paramsArray = []
  const numOfParams = fieldNameArray.length
  for(let i = 0; i < createList.length; i++){
    const stringSubArray = []
    for(let j =0; j < numOfParams; j++){
      const fName = fieldNameArray[j].name
      const fType = fieldNameArray[j].type
      const val = createList[fieldNameArray[j].name]

      stringSubArray.push(`$${i * numOfParams + j + 1}::${fType}`)

    }
    placeHoldersStringArray.push(`(${stringSubArray.join(', ')})`)
    let item = createList[i]
    for(let j=0; j < fieldNameArray.length; j++){
      const fName = fieldNameArray[j].name
      const fType = fieldNameArray[j].type
      const val = item[fieldNameArray[j].name]

      if(key !== '' && fName === key && val === ''){
        paramsArray.push(null)
      }
      else {
        paramsArray.push(val)
      }
    }
  }

  placeHoldersString = placeHoldersStringArray.join(',')
  return {
    placeHoldersString,
    paramsArray
  }
}

export default async (
  tableName,
  operationList
) => {

  return await Promise.all(operationList.map(async op=> {
    if(op.mode === 'INSERT') {
      const createList = 'list' in op ? op.list : []
      const insertFieldNameArray = 'fieldName' in op ? op.fieldName : []

      if (createList.length > 0) {
        const {
          placeHoldersString: insertPlaceHoldersString,
          paramsArray: insertParamsArray
        } = getInsertParams(createList, insertFieldNameArray)



        try {
          return await qNonEmpty(
            `INSERT INTO ${tableName} (${insertFieldNameArray.map(c => c.name).join(',')}) 
        VALUES ${insertPlaceHoldersString} RETURNING id`,
            insertParamsArray
          )

        } catch (err) {
          throw [Errors.DB_OPERATION_FAIL(err)]
        }
      }
      else{
        return []
      }
    }

    if(op.mode === 'UPDATE') {
      const updateList = 'list' in op ? op.list : []
      const updateFieldNameArray = 'fieldName' in op ? op.fieldName : []

      console.log(updateList)
      if (updateList.length > 0) {
        const {
          firstFieldNameString,
          secondFieldNameString,
          placeHoldersString: updatePlaceHoldersString,
          paramsArray: updateParamsArray
        } = getUpdateParams(updateList,updateFieldNameArray)

        const query = `update ${tableName} as t
               set ${firstFieldNameString}
               from (values ${updatePlaceHoldersString}
                    ) as c(${updateFieldNameArray.map(c => c.name).join(',')})
               where c.id = t.id RETURNING t.id`
        try {
          const  result = await qNonEmpty(
            `update ${tableName} as t
               set ${firstFieldNameString}
               from (values ${updatePlaceHoldersString}
                    ) as c(${updateFieldNameArray.map(c => c.name).join(',')})
               where c.id = t.id RETURNING t.id`,
            updateParamsArray
          )
          return result.rows

        } catch (err) {
          throw [Errors.DB_OPERATION_FAIL(err)]
        }
      }
      else {
        return []
      }
    }
  }))
}
