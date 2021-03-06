import React from 'react';


const ResourceRegistrationSessionRequestDetails = ({ data }) => (
  <>
    <div className="row no-gutters align-items-center bg-light rounded p-2 mb-1">
      <div className="col col-sm-4 col-lg-3 col-xl-2">
        <p><i className="icon icon-common icon-leaf" /> <strong>Prefix details</strong></p>
      </div>
      <div className="col col-sm-8 col-lg-9 col-xl-10">
        <table className="table table-sm m-0 table-borderless table-striped">
          <tbody>
            <tr><td className="w-25 pl-2 font-weight-bold">Resource prefix</td><td className="w-75 text-block">{data.namespacePrefix}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="row no-gutters align-items-center bg-light rounded p-2 mb-1">
      <div className="col col-sm-4 col-lg-3 col-xl-2">
        <p><i className="icon icon-common icon-sitemap" /> <strong>Institution details</strong></p>
      </div>
      <div className="col col-sm-8 col-lg-9 col-xl-10">
        <table className="table table-sm m-0 table-borderless table-striped">
          <tbody>
            <tr><td className="w-25 pl-2 font-weight-bold">ROR Id</td><td className="w-75 text-block">{data.institutionRorId}</td></tr>
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
        <p><i className="icon icon-common icon-cube" /> <strong>Provider details</strong></p>
      </div>
      <div className="col col-sm-8 col-lg-9 col-xl-10">
        <table className="table table-sm m-0 table-borderless table-striped">
          <tbody>
            <tr><td className="w-25 pl-2 font-weight-bold">Name</td><td className="w-75 text-block">{data.providerName}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">description</td><td className="w-75 text-block small align-middle">{data.providerDescription}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Home URL</td><td className="w-75 text-block">{data.providerHomeUrl}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Provider code</td><td className="w-75 text-block">{data.providerCode}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">URL Pattern</td><td className="w-75 text-block">{data.providerUrlPattern}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Sample Id</td><td className="w-75 text-block">{data.sampleId}</td></tr>
            <tr><td className="w-25 pl-2 font-weight-bold">Location</td><td className="w-75 text-block">{data.providerLocation}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="row no-gutters align-items-center bg-light rounded p-2 mb-1">
      <div className="col col-sm-4 col-lg-3 col-xl-2">
        <p><i className="icon icon-common icon-user" /> <strong>Requester details</strong></p>
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


export default ResourceRegistrationSessionRequestDetails;
