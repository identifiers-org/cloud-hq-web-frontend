import React from 'react';
import { Link } from 'react-router-dom';


const NamespaceItem = (namespace) => {
  return (
    <tr>
      <td className="narrow align-middle">
        <Link to={`/registry/${namespace.prefix}`} className="clear-link text-primary">
          {namespace.name}
        </Link>
      </td>
      <td className="med align-middle text-center">
        <span
          className="text-warning font-weight-bold border border-secondary badge badge-dark"
        >
          {namespace.prefix}
        </span>
      </td>
      <td>
        <p className="small m-0">{namespace.description}</p>
      </td>
    </tr>
  );
};


export default NamespaceItem;
