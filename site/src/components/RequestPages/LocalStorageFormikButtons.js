import React from "react";
import {useFormikContext} from "formik";
import {swalError, swalSuccess} from "../../utils/swalDialogs";

const LOCALSTORAGE_KEY = "PrefixRequestSavedValues";

export const SaveFormButton = () => {
  const {values, isValid} = useFormikContext()

  const saveCurrentValuesToLocalStorage = () => {
    if (isValid) {
      const stringifyiedCurrentValues = JSON.stringify(values);
      localStorage.setItem(LOCALSTORAGE_KEY, stringifyiedCurrentValues);
      swalSuccess.fire({
        title: "Current form values saved successfully",
        text: "Current form values were saved successfully, " +
          "when you wish to continue the session, " +
          "click on the load button bellow",
        icon: "success",
      })
    } else {
      swalError.fire({
        icon: "error",
        title: "Error on value save",
        text: "Make sure that the form is valid before saving"
      })
    }
  }

  return (
    <button className="form-control btn btn-secondary"
            type="button" onClick={saveCurrentValuesToLocalStorage}>
      Save contents
    </button>
  )
}

export const clearSavedFormData = () => {
  localStorage.removeItem(LOCALSTORAGE_KEY)
}

export const LoadFormButton = () => {
  const {setValues} = useFormikContext()

  const setValuesFromLocalStorage = () => {
    const localStorageValues = localStorage.getItem(LOCALSTORAGE_KEY);
    if (localStorageValues) {
      try {
        const parsedLocalStorage = JSON.parse(localStorageValues);
        setValues(parsedLocalStorage);
        swalSuccess.fire({
          icon: "success",
          title: "Load successful",
          text: "Your data was successfully loaded"
        })
      } catch {
        swalError.fire({
          icon: "error",
          title: "Error on value load",
          text: "We couldn't parse the current saved form"
        })
      }
    } else {
      swalError.fire({
        icon: "error",
        title: "Error on value load",
        text: "We couldn't find any saved form. Perhaps you didn't save before or you cleared you local data"
      })
    }
  }

  return (
    <button className="form-control btn btn-secondary"
            type="button" onClick={setValuesFromLocalStorage}>
      Load previous save
    </button>
  )
}

