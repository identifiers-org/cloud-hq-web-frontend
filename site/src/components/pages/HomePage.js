import React from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// Components.
import Search from '../HomePage/Search';
import { useMatomo } from '@jonkoops/matomo-tracker-react';

// Utils.
import { isIpadScreen, isSmallScreen } from '../../utils/responsive';


class HomePage extends React.Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(window.location.search);
    this.state = {
      query: params.get('query') || ''
    };
  }

  componentDidMount () {
    const { trackPageView } = this.props.matomo

    trackPageView()
  }

  handleClickPrefixRegistrationRequestForm = () => { this.props.navigate('/prefixregistrationrequest') };
  handleClickRegistryBrowser = () => { this.props.navigate('/registry') };
  handleSuggestionAction = (query) => { this.props.navigate(`/registry/${query}`); }

  // Takes user to search if there are no prefixes matching that exact query in the namespace list, otherwise
  // will redirect to the matching namespace page.
  handleSearchAction = (query) => {
    const { namespaceList, navigate } = this.props;

    const exactMatch = namespaceList.find(namespace => namespace.prefix === query);
    const redirectUrl = exactMatch ? `/registry/${query}` : `/registry?query=${query}`;

    navigate(redirectUrl);
  }

  render() {
    const {
      handleClickPrefixRegistrationRequestForm,
      handleClickRegistryBrowser,
      handleSearchAction,
      handleSuggestionAction,
      state: { query }
    } = this;

    const boxPadding = isSmallScreen() || isIpadScreen() ? 'p-3' : 'p-5';
    const searchBarPadding = isSmallScreen() ? 'p-1' : 'px-5';
    const topSpacer = isSmallScreen() ? '' : 'spacer-8';

    return (
      <div className={`row border ${topSpacer}`}>
        <div className={`col col-12 col-xl-6 ${boxPadding}`}>
          <h1 className="text-primary mb-4">Identifiers.org Central Registry</h1>
          <div className="d-flex">
            <p className="mb-0 text-justify text-muted">
              The <span className="text-dark">Identifiers.org</span> Central Registry service provides a centralized
              directory of Compact Identifiers. This website allows performing searches on the registry by using the
              search bar on the right side or the <a
                href="#!"
                className="text-primary"
                onClick={handleClickRegistryBrowser}
              >
                Registry Browser
              </a>. Resource maintainers can also find the <a
                href="#!"
                className="text-primary"
                onClick={handleClickPrefixRegistrationRequestForm}
              >
                Prefix Registration Request form
              </a> to request a prefix in Identifiers.org for their databases or services.
            </p>
          </div>
        </div>

        <div className="col col-12 col-xl-6 bg-light">
          <h4 className={`mt-3 ${boxPadding}`}><i className="icon icon-common icon-search mr-2"/>
            Search the registry <br/>
          </h4>
          <div className={`row justify-content-center mt-2 ${searchBarPadding}`}>
            <div className="col col-lg-7 col-xl-12">
              <Search
                  buttonCaption={<span><i className="icon icon-common icon-search mr-1"/> Search</span>}
                  placeholderCaption="Enter a namespace to search the registry"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}


// Redux mappings.
const mapStateToProps = (state) => ({
  namespaceList: state.registryBrowser.namespaceList
});

const ConnectedHomepage = connect (mapStateToProps)(HomePage)
export default function(props) {
  const navigate = useNavigate();
  const matomo = useMatomo();

  return <ConnectedHomepage {...props} matomo={matomo} navigate={navigate}/>
}
