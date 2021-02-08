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
      const f = fieldNameArray[j]
      const fName = f.name
      const fReplace = 'replacement' in f && f.replacement
      const val = fReplace ? item[fReplace] : item[fName]

      if(key !== '' && fName === key && val === ''){
        paramsArray.push(null)
      }
      else {
        paramsArray.push(val)
      }
    }
  }
  console.log(paramsArray)
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
      const key = op.key
      const createList = 'list' in op ? op.list : []
      const insertFieldArray = 'fieldName' in op ? op.fieldName : []
      const insertFieldNameArray = insertFieldArray.map(f => f.name)
      const insertFieldNameArrayString = insertFieldNameArray.join(', ')

      let multiRowValues = []
      let multiRowValueString = ''
      if (createList.length > 0) {

        for(let i = 0; i < createList.length; i++){
          let rowValuesString = ''
          let rowValues = []
          let item = createList[i]
          insertFieldArray.map(f => {
            const fName = f.name
            const fType = f.type
            const attr = 'replacement' in f ? f.replacement : f.name
            const val = item[attr]
            if(fName === key && val === ''){
              rowValues.push(`null::${fType}`)
            }
            else if(val === null){
              rowValues.push(`null::${fType}`)
            }
            else{
              rowValues.push(`'${val}'::${fType}`)
            }
          })
          multiRowValues.push(`(${rowValues.join(', ')})`)
        }

        multiRowValueString = multiRowValues.join(', ')

        try {
          const result =  await qNonEmpty(
            `WITH input_rows(${insertFieldNameArrayString}) AS (
             VALUES 
                ${multiRowValueString}
             ),
           ins AS (
             INSERT INTO ${tableName} (${insertFieldNameArrayString}) 
             SELECT * FROM input_rows
             ON CONFLICT (${key}) DO NOTHING
             RETURNING id          
             )
          SELECT 'i' AS source, id                
          FROM   ins
          UNION  ALL
          SELECT 's' AS source, u.id   
          FROM   input_rows
            JOIN ${tableName} u USING (${key}); `)
          return result.rows

        } catch (err) {
          throw [Errors.DB_OPERATION_FAIL(err)]
        }
      }
      else{
        return []
      }
    }

    if(op.mode === 'UPDATE') {
      const key = op.key
      const updateList = 'list' in op ? op.list : []
      const updateFieldArray = 'fieldName' in op ? op.fieldName : []

      if (updateList.length > 0) {

        console.log(updateList)
        const {
          firstFieldNameString,
          secondFieldNameString,
          placeHoldersString: updatePlaceHoldersString,
          paramsArray: updateParamsArray
        } = getUpdateParams(updateList, updateFieldArray, key)



        try {
          const results =  await agent.transaction([
            {
              query: `update ${tableName} as t
               set ${firstFieldNameString}
               from (values ${updatePlaceHoldersString}
                    ) as c(${updateFieldArray.map(c => c.name).join(',')})
               where c.id = t.id RETURNING t.id`,
              values: updateParamsArray
            }
          ])
          return results[0].rows

        } catch (err) {
          throw [Errors.DB_OPERATION_FAIL(err)]
        }
      }
      else{
        return []
      }
    }
  }))
}
