import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLeaf,
  faSitemap,
  faCube,
  faUser
} from '@fortawesome/free-solid-svg-icons';


const PrefixRegistrationSessionRequestDetails = ({ data }) => (
  <>
    <div className="row no-gutters align-items-center bg-light rounded p-2 mb-1">
      <div className="col col-sm-4 col-lg-3 col-xl-2">
        <p><FontAwesomeIcon icon={faLeaf} /> <strong>Prefix details</strong></p>
      </div>
      <div className="col col-sm-8 col-lg-9 col-xl-10">
        <table className="table table-sm m-0 table-borderless table-striped">
          <tbody>
            <tr><td className="w-25 pl-2 font-weight-bold">Resource name</td><td className="w-75 text-block">{data.name}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Description</td><td className="w-75 text-block small align-middle">{data.description}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Requested prefix</td><td className="w-75 text-block">{data.requestedPrefix}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Regex pattern</td><td className="w-75 text-block">{data.idRegexPattern}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Supporting References</td><td className="w-75 text-block small align-middle">{data.supportingReferences}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Additional information</td><td className="w-75 text-block">{data.additionalInformation}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="row no-gutters align-items-center bg-light rounded p-2 mb-1">
      <div className="col col-sm-4 col-lg-3 col-xl-2">
        <p><FontAwesomeIcon icon={faSitemap} /> <strong>Institution details</strong></p>
      </div>
      <div className="col col-sm-8 col-lg-9 col-xl-10">
        <table className="table table-sm m-0 table-borderless table-striped">
          <tbody>
            <tr><td className="w-25 pl-2 font-weight-bold">Name</td><td className="w-75 text-block">{data.institutionName}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">description</td><td className="w-75 text-block small align-middle">{data.institutionDescription}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Home URL</td><td className="w-75 text-block">{data.institutionHomeUrl}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Location</td><td className="w-75 text-block">{data.institutionLocation}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="row no-gutters align-items-center bg-light rounded p-2 mb-1">
      <div className="col col-sm-4 col-lg-3 col-xl-2">
        <p><FontAwesomeIcon icon={faCube} /> <strong>Provider details</strong></p>
      </div>
      <div className="col col-sm-8 col-lg-9 col-xl-10">
        <table className="table table-sm m-0 table-borderless table-striped">
          <tbody>
            <tr><td className="w-25 pl-2 font-weight-bold">Name</td><td className="w-75 text-block">{data.providerName}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">description</td><td className="w-75 text-block small align-middle">{data.providerDescription}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Home URL</td><td className="w-75 text-block">{data.providerHomeUrl}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Provider code</td><td className="w-75 text-block">{data.providerCode}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">URL Pattern</td><td className="w-75 text-block">{data.providerUrlPattern}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Location</td><td className="w-75 text-block">{data.providerLocation}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="row no-gutters align-items-center bg-light rounded p-2 mb-1">
      <div className="col col-sm-4 col-lg-3 col-xl-2">
        <p><FontAwesomeIcon icon={faUser} /> <strong>Requester details</strong></p>
      </div>
      <div className="col col-sm-8 col-lg-9 col-xl-10">
        <table className="table table-sm m-0 table-borderless table-striped">
          <tbody>
            <tr><td className="w-25 pl-2 font-weight-bold">Full name</td><td className="w-75 text-block">{data.requesterName}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Email</td><td className="w-75 text-block">{data.requesterEmail}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </>
);


export default PrefixRegistrationSessionRequestDetails;
