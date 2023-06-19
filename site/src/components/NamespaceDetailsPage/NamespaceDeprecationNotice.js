import React, { useState } from 'react';
import moment from "moment/moment";
import NamespaceDeprecationForm from "./NamespaceDeprecationForm";
import RoleConditional from "../common/RoleConditional";

const OptionalValue = props => props.value && props.children

const LinkHelper = ({prefix}) => <a href={`/registry/${prefix}`}>{prefix}</a>

export default ({namespace, setEditing}) =>
  <div className="row justify-content-md-center p-3 mb-3">
    <div className="col col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-8 bg-danger p-2">
      <h3 className="text-center text-white mb-2">
        <i className="icon icon-common icon-trash mr-3"/>
        This namespace is <strong>deactivated</strong>
        <RoleConditional requiredRoles={['editNamespace']}>
          <button className="text-white float-right" onClick={setEditing}><i className="icon icon-common icon-edit"></i></button>
        </RoleConditional>
      </h3>
      <p className="mb-0 text-white">
        The service is not
        active {namespace.deprecationOfflineDate ? `since ${moment(namespace.deprecationOfflineDate).format('ll')}` : ""} and
        has been marked as deactivated since {moment(namespace.deprecationDate).format('ll')}.
      </p>
      <OptionalValue value={namespace.deprecationStatement}>
        <p className="mb-0 text-white"> {namespace.deprecationStatement} </p>
      </OptionalValue>
      <OptionalValue value={namespace.infoOnPostmortemAccess}>
        <p className="mb-0 text-white"> Instructions for access: {namespace.infoOnPostmortemAccess} </p>
      </OptionalValue>
      <OptionalValue value={namespace.successor}>
        <p className="mb-0 text-white"> Namespace <LinkHelper prefix={namespace.successor.prefix} /> is deemed as successor of this namespace and should be used in it's place.</p>
      </OptionalValue>
    </div>
  </div>

