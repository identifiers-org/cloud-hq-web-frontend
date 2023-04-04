import React from 'react';
import moment from 'moment';

import { Link } from 'react-router-dom';

import ResourceRegistrationSessionRequest from './ResourceRegistrationSessionRequest';


class ResourceRegistrationSessionItem extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      expanded: false
    };
  }

  toggle = () => {
    this.setState(state => ({ expanded: !state.expanded }));
  }


  render() {
    const { id, resourceRegistrationRequest } = this.props.request;
    const { expanded } = this.state;

    return (
      <div>
        <div className="card mb-3">
          <div className="card-header">
            <div className="row justify-content-between">
              <div className="col col-md-10 col-lg-9 col-xl-10">
                <a
                  className="clear-link"
                  href="#!"
                  onClick={this.toggle}
                >
                  <p className="m-0">
                    {expanded ? <i className="icon icon-common icon-minus mr-2" /> : <i className="icon icon-common icon-plus mr-2" />}
                    <strong>Requested Resource: </strong>
                    Provider <strong>{resourceRegistrationRequest.providerCode}</strong> for namespace <strong>{resourceRegistrationRequest.namespacePrefix}</strong>
                  </p>
                  <p className="m-0 pl-2 text-small text-muted">
                    <small>
                      <strong>Date of original request: </strong>
                      {moment(resourceRegistrationRequest.created).format('llll')}
                    </small>
                  </p>
                </a>
              </div>
              <div className="col col-md-2 col-lg-3 col-xl-2 pt-2">
                <Link
                  className="clear-link btn btn-warning btn-block"
                  to={`/curation/resourceRegistration/${id}`}
                >
                  <i className="icon icon-common icon-ellipsis-h" /> Manage
                </Link>
              </div>
            </div>
          </div>

          {expanded && (
            <div className="card-body">
              <ResourceRegistrationSessionRequest data={resourceRegistrationRequest} />
            </div>
          )}
        </div>
      </div>
    );
  }
}


export default ResourceRegistrationSessionItem;
