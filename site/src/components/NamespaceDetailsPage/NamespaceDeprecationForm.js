import React from "react";
import { Formik, Form, Field } from "formik";

const formContents = () =>
  <Form>
    <div className="form-group">
      <label className="text-white" htmlFor="deprecationOfflineDate">Approximated expiration date</label>
      <Field type="date" className="form-control" name="deprecationOfflineDate" placeholder="Approximated expiration date" />
    </div>
    <div className="form-group">
      <label className="text-white" htmlFor="deprecationStatement">DeprecationStatement</label>
      <Field as="textarea" className="form-control textarea" name="deprecationStatement" placeholder="Deprecation statement" rows={5} />
    </div>
    <div className="form-group">
      <label className="text-white" htmlFor="infoOnPostmortemAccess">Description of possible data acquisition</label>
      <Field as="textarea" className="form-control textarea" name="infoOnPostmortemAccess" placeholder="Description on how to acquire access" rows={5} />
    </div>
    <div className="form-group">
      <label className="text-white" htmlFor="successor">Successor namespace</label>
      <Field type="text" className="form-control" name="successor" />
    </div>
    <button type="submit" className="btn btn-success">Save</button>
    <button type="reset" className="btn btn-primary ml-1">Reset</button>
  </Form>



const onSubmit = values => {}

export default ({namespace, closeEditing}) =>
  <div className="row  p-3 mb-3">
    <div className="bg-danger p-1">
      <h3 className="text-white">
        Deprecation details
        <button className="float-right text-white" onClick={closeEditing}><i className="icon icon-common icon-close"></i></button>
      </h3>
      <Formik
        initialValues={namespace}
        onSubmit={console.log}
        component={formContents}
      />
    </div>
  </div>