import React, {useEffect} from 'react';
import {Formik} from "formik";
import { useMatomo } from '@jonkoops/matomo-tracker-react';

import ResourceRegistrationRequestSchema, {ResourceRequestInitialValues} from
    "../RequestPages/ResourceRegistrationRequestSchema";
import PageTitle from '../common/PageTitle';

import ResourceRequestForm, {submitResourceRequest} from '../RequestPages/ResourceRequestForm';
import {swalError, swalSuccess} from "../../utils/swalDialogs";
import {clearSavedFormData} from "../RequestPages/LocalStorageFormikButtons";


const onSubmit = async (values) =>
  submitResourceRequest(values)
    .then(response =>
      response.json().then(json => {
        if (response.ok)
          swalSuccess.fire({
            icon: 'success',
            title: 'Resource registration request sent',
            text: 'Thank you. We will contact you shortly with more information about your request'
          }).then(clearSavedFormData)
        else
          swalError.fire({
            icon: 'error',
            title: 'Something went wrong when submitting request',
            text: json.errorMessage
          })
      })
    ).catch(err => {
      console.error(err)
      swalError.fire({
        icon: 'error',
        title: 'Something went wrong when submitting request',
        text: err.message
      })
    });

export default () => {
  const { trackPageView } = useMatomo()
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development')
      trackPageView();
  })

  return (
    <>
      <PageTitle
        icon="icon-list"
        title="Request resource form"
        description={"Please complete this form to register a new resource, in an existing namespace, that can be recognized by the meta-resolvers at identifiers.org and n2t.net. Completing all fields will enable a swift processing of your request."}
      />

      <div className="container py-3">
        <div className="row">
          <div className="mx-auto col-sm-12 col-lg-10">
            <Formik
              initialValues={ResourceRequestInitialValues}
              validationSchema={ResourceRegistrationRequestSchema}
              onSubmit={onSubmit}
              validateOnBlur={true}
              validateOnChange={false}
              validateOnMount={false}
              displayName="PrefixRegistrationForm"
              component={ResourceRequestForm}
            />
          </div>
        </div>
      </div>
    </>
  )
}
