import React from 'react';
import { connect } from 'react-redux';

// Actions.
import { getResourceRegistrationSessionFromRegistry } from '../../actions/CurationDashboardPage/ResourceRegistrationSession';

// Components.
import RegistrationSessionNewEventBtn from '../CurationDashboardPage/RegistrationSessionNewEventBtn';

import RegistrationSessionEvent from '../CurationDashboardPage/RegistrationSessionEvent';

// import RegistrationSessionAcceptForm from '../CurationDashboardPage/ResourceRegistrationSessionAcceptForm';
// import RegistrationSessionAmendForm from '../CurationDashboardPage/ResourceRegistrationSessionAmendForm';
// import RegistrationSessionCommentForm from '../CurationDashboardPage/ResourceRegistrationSessionCommentForm';
// import RegistrationSessionRejectForm from '../CurationDashboardPage/ResourceRegistrationSessionRejectForm';

import ResourceRegistrationSessionRequestDetails from '../CurationDashboardPage/ResourceRegistrationSessionRequest';
import PageTitle from '../common/PageTitle';


class ManageResourceRegistrationRequestPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      acceptFormVisible: false,
      amendFormVisible: false,
      commentFormVisible: false,
      rejectFormVisible: false
    };
  }

  componentDidMount() {
    const { id } = this.props.match.params;

    this.updateResourceRegistrationSession(id);
  }


  updateResourceRegistrationSession = (id) => {
    this.props.getResourceRegistrationSession(id);
  }


  //
  // Form management functions.
  //
  hideAllForms = () => {
    this.setState({
      acceptFormVisible: false,
      amendFormVisible: false,
      commentFormVisible: false,
      rejectFormVisible: false
    });
  }

  handleFormVisibility = (formName) => {
    const { id } = this.props.match.params;

    this.hideAllForms();
    this.setState({[`${formName}Visible`]: !this.state[`${formName}Visible`]});
    this.updateResourceRegistrationSession(id);
  }

  handleFormSubmit = () => {
    const { id } = this.props.match.params;

    this.hideAllForms();
    this.updateResourceRegistrationSession(id);
  }


  render() {
    const {
      handleFormSubmit,
      handleFormVisibility,
      props: {
        resourceRegistrationSession: {
          resourceRegistrationRequest,
          resourceRegistrationSessionEvents
        },
        match: { params: { id } }
      },
      state: {
        acceptFormVisible,
        amendFormVisible,
        commentFormVisible,
        rejectFormVisible
      }
    } = this;


    return (
      !resourceRegistrationRequest ? '' : (
      <>
        <PageTitle
          icon="icon-leaf"
          title={`Managing request:`}
          extraTitle={resourceRegistrationRequest.providerCode}
        />

        <div className="row">
          <div className="col">
            <div className="card-body">
              <h4><i className="icon icon-common icon-hand-point-up" /> Current request details</h4>
              <ResourceRegistrationSessionRequestDetails
                data={resourceRegistrationRequest}
              />
            </div>
          </div>
        </div>

        <div className="row mt-5 mx-0">
          <RegistrationSessionNewEventBtn
            caption="Accept"
            color="success"
            handleShow={() => handleFormVisibility('acceptForm')}
            icon="check"
            isCancel={acceptFormVisible}

          />
          <RegistrationSessionNewEventBtn
            caption="Amend"
            color="warning"
            handleShow={() => handleFormVisibility('amendForm')}
            icon="edit"
            isCancel={amendFormVisible}
          />
          <RegistrationSessionNewEventBtn
            caption="Comment"
            color="secondary"
            handleShow={() => handleFormVisibility('commentForm')}
            icon="comment"
            isCancel={commentFormVisible}
          />
          <RegistrationSessionNewEventBtn
            caption="Reject"
            color="danger"
            handleShow={() => handleFormVisibility('rejectForm')}
            icon="times"
            isCancel={rejectFormVisible}
          />
        </div>

        {/* <ResourceRegistrationSessionAcceptForm
          id={id}
          isOpen={acceptFormVisible}
        />

        <ResourceRegistrationSessionAmendForm
          id={id}
          isOpen={amendFormVisible}
          handleShow={() => handleFormVisibility('acceptForm')}
          handleFormSubmit={handleFormSubmit}
        />

        <ResourceRegistrationSessionCommentForm
          id={id}
          isOpen={commentFormVisible}
          handleShow={() => handleFormVisibility('acceptForm')}
          handleFormSubmit={handleFormSubmit}
        />

        <ResourceRegistrationSessionRejectForm
          id={id}
          isOpen={rejectFormVisible}
          handleShow={() => handleFormVisibility('acceptForm')}
          handleFormSubmit={handleFormSubmit}
        /> */}

        <hr className="my-5" />

        <div className="row">
          <div className="col">
            <h4><i className="icon icon-common icon-history" /> Previous events</h4>
            {
              resourceRegistrationSessionEvents.map(prse =>
                <RegistrationSessionEvent
                  key={`prse-${prse.name}-${prse.created}`}
                  data={prse}
                  registrationSessionType="resource"
                />
              )
            }
          </div>
        </div>
      </>
      )
    );
  }
}


// Mapping
const mapStateToProps = (state) => ({
  resourceRegistrationSession: state.curationDashboard.resourceRegistrationSession
});

const mapDispatchToProps = (dispatch) => ({
  getResourceRegistrationSession: (params) => dispatch(getResourceRegistrationSessionFromRegistry(params)),
});

export default connect (mapStateToProps, mapDispatchToProps)(ManageResourceRegistrationRequestPage);
