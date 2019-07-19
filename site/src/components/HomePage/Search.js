import React from 'react';
import SearchSuggestions from './SearchSuggestions';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

// Actions.
import { getNamespacesFromRegistry } from '../../actions/NamespaceList';

// Config.
import { config } from '../../config/Config';

// Utils.
import { isSmallScreen } from '../../utils/responsive';
import { querySplit } from '../../utils/identifiers';


class Search extends React.Component {
  constructor(props) {
    super(props);
    this.search = React.createRef();

    this.state = {
      query: '',
      queryParts: {
        resource: undefined,
        prefix: undefined,
        prefixEffectiveValue: undefined,
        id: undefined,
        idWithEmbeddedPrefix: undefined,
        bad: []
      },
      activeSuggestion: -1,
      namespaceList: []
    }
  }

  componentDidMount() {
    this.updateNamespaceList();
  }


  updateNamespaceList = async () => {
    const {
      props: {
        getNamespacesFromRegistry,
      },
      state: { queryParts: { prefixEffectiveValue } }
    } = this;

    // set active suggestion to -1.
    this.setState({activeSuggestion: -1});

    await getNamespacesFromRegistry({
      content: prefixEffectiveValue
    });
    this.setState({
      namespaceList: this.props.namespaceList.sort((a, b) => {
        if (a.prefix.startsWith(prefixEffectiveValue) && !b.prefix.startsWith(prefixEffectiveValue)) {
          return -1;
        };

        if (!a.prefix.startsWith(prefixEffectiveValue) && b.prefix.startsWith(prefixEffectiveValue)) {
          return 1;
        }

        return a.prefix - b.prefix;
      })
      .slice(0, config.suggestionListSize)
    });
  }


  handleChange = () => {
    const { updateNamespaceList } = this;

    this.setState({
      query: this.search.value,
      queryParts: querySplit(this.search.value)
    }, () => {
      updateNamespaceList();
    });
  };

  handleFocusShowSuggestions = () => {
    const { search } = this;

    // Also scroll down to take the suggestion bar to the top of screen in small screens.
    if (isSmallScreen()) {
      const searchBarYOffset = search.getBoundingClientRect().top + window.pageYOffset - 130;
      window.scroll({top: searchBarYOffset, behavior: 'smooth'});
    }
  };

  handleKeyDown = (e) => {
    const {
      state: {namespaceList, activeSuggestion, query}
    } = this;

    switch (e.keyCode) {
    case 13: {  // Enter key
      e.preventDefault();
      if (activeSuggestion === -1) {
        this.props.history.push(`/registry?query=${query}`);
      } else {
        this.props.history.push(`/registry/${namespaceList[activeSuggestion].prefix}`);
        break;
      }
    }

    case 38: {  // Up key
      if (this.state.activeSuggestion > -1) {
        this.setState({activeSuggestion: activeSuggestion - 1});
      }
      break;
    }

    case 40: {  // Down key
      if (activeSuggestion < namespaceList.length - 1) {
        this.setState({activeSuggestion: activeSuggestion + 1});
      }
      break;
    }
    }
  }

  handleMouseOver = (index) => {
    this.setState({activeSuggestion: index});
  }

  handleSuggestionClick = (prefix) => {
    this.props.history.push(`/registry/${prefix}`);
  }

  handleSubmit = (e) => {
    const {query} = this.state;

    e.preventDefault();
    this.props.history.push(`/registry?query=${query}`);
  }


  render() {
    const {
      handleChange, handleFocusShowSuggestions, handleKeyDown, handleMouseOver, handleSubmit, handleSuggestionClick,
      state: {namespaceList, activeSuggestion, query, queryParts}
    } = this;

    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="input-group inline-search-input-group">
            <input
              autoFocus={!isSmallScreen()}
              className="form-control search-input"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter a namespace to search the registry"
              onFocus={handleFocusShowSuggestions}
              ref={input => this.search = input}
              value={query}
            />
            <div className="input-group-append">
              <button className="btn btn-primary">
                <i className="icon icon-common icon-search" /> Search
              </button>
            </div>
          </div>
          <SearchSuggestions
            mouseOver={handleMouseOver}
            onClick={handleSuggestionClick}
            query={query}
            queryParts={queryParts}
            searchSuggestionList={namespaceList}
            selectedSearchSuggestion={activeSuggestion}
          />
        </div>
      </form>
    )
  }
}


const mapStateToProps = (state) => ({
  namespaceList: state.registryBrowser.namespaceList
});

const mapDispatchToProps = (dispatch) => ({
  getNamespacesFromRegistry: (params) => dispatch(getNamespacesFromRegistry(params))
});

export default withRouter(connect (mapStateToProps, mapDispatchToProps)(Search));
