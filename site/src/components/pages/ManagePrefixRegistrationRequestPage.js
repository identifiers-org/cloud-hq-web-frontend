import React from 'react';
import { connect } from 'react-redux';
import { useMatomo } from '@jonkoops/matomo-tracker-react';

// Actions.
import { getPrefixRegistrationSessionFromRegistry } from '../../actions/CurationDashboardPage/PrefixRegistrationSession';

// Components.
import RegistrationSessionNewEventBtn from '../CurationDashboardPage/RegistrationSessionNewEventBtn';

import RegistrationSessionEvent from '../CurationDashboardPage/RegistrationSessionEvent';

import PrefixRegistrationSessionAcceptForm from '../CurationDashboardPage/PrefixRegistrationSessionAcceptForm';
import PrefixRegistrationSessionAmendForm from '../CurationDashboardPage/PrefixRegistrationSessionAmendForm';
import PrefixRegistrationSessionCommentForm from '../CurationDashboardPage/PrefixRegistrationSessionCommentForm';
import PrefixRegistrationSessionRejectForm from '../CurationDashboardPage/PrefixRegistrationSessionRejectForm';

import PrefixRegistrationSessionRequestDetails from '../CurationDashboardPage/PrefixRegistrationSessionRequest';
import PageTitle from '../common/PageTitle';

import { useParams } from 'react-router-dom';

class ManagePrefixRegistrationRequestPage extends React.Component {
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
    const { trackPageView } = this.props.matomo
    trackPageView();

    const { id } = this.props.params;
    this.updatePrefixRegistrationSession(id);
  }


  updatePrefixRegistrationSession = (id) => {
    this.props.getPrefixRegistrationSession(id);
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
    const { id } = this.props.params;

    this.hideAllForms();
    this.setState({[`${formName}Visible`]: !this.state[`${formName}Visible`]});
    this.updatePrefixRegistrationSession(id);
  }

  handleFormSubmit = () => {
    const { id } = this.props.params;

    this.hideAllForms();
    this.updatePrefixRegistrationSession(id);
  }


  render() {
    const {
      handleFormSubmit,
      handleFormVisibility,
      props: {
        prefixRegistrationSession: {
          prefixRegistrationRequest,
          prefixRegistrationSessionEvents
        },
        params: { id }
      },
      state: {
        acceptFormVisible,
        amendFormVisible,
        commentFormVisible,
        rejectFormVisible
      }
    } = this;


    return (
      !prefixRegistrationRequest ? '' : (
      <>
        <PageTitle
          icon="icon-leaf"
          title={`Managing request:`}
          extraTitle={prefixRegistrationRequest.name}
        />

        <div className="row">
          <div className="col">
            <div className="card-body">
              <h4><i className="icon icon-common icon-hand-point-up" /> Current request details</h4>
              <PrefixRegistrationSessionRequestDetails
                data={prefixRegistrationRequest}
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

        <PrefixRegistrationSessionAcceptForm
          id={id}
          isOpen={acceptFormVisible}
        />

        <PrefixRegistrationSessionAmendForm
          id={id}
          isOpen={amendFormVisible}
          handleShow={() => handleFormVisibility('acceptForm')}
          handleFormSubmit={handleFormSubmit}
        />

        <PrefixRegistrationSessionCommentForm
          id={id}
          isOpen={commentFormVisible}
          handleShow={() => handleFormVisibility('acceptForm')}
          handleFormSubmit={handleFormSubmit}
        />

        <PrefixRegistrationSessionRejectForm
          id={id}
          isOpen={rejectFormVisible}
          handleShow={() => handleFormVisibility('acceptForm')}
          handleFormSubmit={handleFormSubmit}
        />

        <hr className="my-5" />

        <div className="row">
          <div className="col">
            <h4><i className="icon icon-common icon-history" /> Previous events</h4>
            {
              prefixRegistrationSessionEvents.map(prse =>
                <RegistrationSessionEvent
                  key={`prse-${prse.name}-${prse.created}`}
                  data={prse}
                  registrationSessionType="prefix"
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
  prefixRegistrationSession: state.curationDashboard.prefixRegistrationSession
});

const mapDispatchToProps = (dispatch) => ({
  getPrefixRegistrationSession: (params) => dispatch(getPrefixRegistrationSessionFromRegistry(params)),
});

const ConnectedManagePrefixRegistrationRequestPage = connect (mapStateToProps, mapDispatchToProps)(ManagePrefixRegistrationRequestPage)
export default function(props) {
  const params = useParams();
  const matomo = useMatomo();
  return <ConnectedManagePrefixRegistrationRequestPage {...props} matomo={matomo} params={params} />
}
