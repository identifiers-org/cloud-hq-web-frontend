import React from 'react';
import { connect } from 'react-redux';

// Components.
import Search from '../HomePage/Search';

// Utils.
import { isIpadScreen, isSmallScreen } from '../../utils/responsive';


class HomePage extends React.Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(props.location.search);

    this.state = {
      query: params.get('query') || ''
    };
  }


  handleClickPrefixRegistrationRequestForm = () => { this.props.history.push('/prefixregistrationrequest') };
  handleClickRegistryBrowser = () => { this.props.history.push('/registry') };
  handleSuggestionAction = (query) => { this.props.history.push(`/registry/${query}`); }

  // Takes user to search if there are no prefixes matching that exact query in the namespace list, otherwise
  // will redirect to the matching namespace page.
  handleSearchAction = (query) => {
    const { namespaceList } = this.props;

    const exactMatch = namespaceList.find(namespace => namespace.prefix === query);
    const redirectUrl = exactMatch ? `/registry/${query}` : `/registry?query=${query}`;

    this.props.history.push(redirectUrl);
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
          <h4 className={`mt-3 ${boxPadding}`}><i className="icon icon-common icon-search mr-2" />Search the registry</h4>
          <div className={`row justify-content-center mt-2 ${searchBarPadding}`}>
            <div className="col col-lg-7 col-xl-12">
              <Search
                query={query}
                button={true}
                buttonCaption={<span><i className="icon icon-common icon-search mr-1" /> Search</span>}
                placeholderCaption="Enter a namespace to search the registry"
                handleSearchAction={handleSearchAction}
                handleSuggestionAction={handleSuggestionAction}
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

export default connect (mapStateToProps)(HomePage);
