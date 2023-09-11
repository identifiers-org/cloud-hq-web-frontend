import React from 'react';
import { connect } from 'react-redux';

// Actions.
import { getNamespacesFromRegistry } from '../../actions/NamespaceList';

// Components.
import SearchSuggestions from './SearchSuggestions';

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
      showSuggestions: true,
      correctQuery: false,
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
        }

        if (!a.prefix.startsWith(prefixEffectiveValue) && b.prefix.startsWith(prefixEffectiveValue)) {
          return 1;
        }

        return a.prefix - b.prefix;
      })
      .slice(0, config.suggestionListSize)
    });
  }


  handleChange = () => {
    const {
      updateNamespaceList,
      props: { handleChangeAction = () => {} }
    } = this;

    this.setState({
      query: this.search.value,
      queryParts: querySplit(this.search.value),
      showSuggestions: true,
      validQuery: false
    }, () => {
      updateNamespaceList();
    });

    handleChangeAction(this.search.value);
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
      handleSuggestionClick,
      props: { handleSearchAction },
      state: { namespaceList, activeSuggestion, query }
    } = this;

    switch (e.keyCode) {
    case 13: {  // Enter key
      e.preventDefault();   // Do not send form.

      if (activeSuggestion !== -1) {
        handleSuggestionClick(namespaceList[activeSuggestion].prefix);
        break;
      } else {
        handleSearchAction(query)
        break;
      }
    }

    case 38: {  // Up key
      e.preventDefault();   // Do not take cursor to start of input text.

      if (this.state.activeSuggestion > -1) {
        this.setState({activeSuggestion: activeSuggestion - 1});
      }
      break;
    }

    case 40: {  // Down key
      e.preventDefault();   // Do not take cursor to end of input text.

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
    const {
      updateNamespaceList,
      props: { handleSuggestionAction }
     } = this;

    this.setState({
      query: prefix,
      queryParts: querySplit(prefix),
      showSuggestions: false,
      validQuery: true
    }, () => {
      updateNamespaceList();
    });

    handleSuggestionAction(prefix);
  }

  handleSubmit = e => {
    const {
      props: { handleSearchAction },
      state: { query }
    } = this;

    e.preventDefault();
    handleSearchAction(query);
  }

  isValidQuery = () => {
    const {
      props: { namespaceList }
    } = this;

    if (!this.state.query) return '';
    return namespaceList.find(namespace => namespace.prefix === this.state.query) ? 'is-valid' : 'is-invalid';
  }


  render() {
    const {
      handleChange, handleFocusShowSuggestions, handleKeyDown, handleMouseOver, handleSubmit, handleSuggestionClick, isValidQuery,
      props: { button = false, buttonCaption, id = 'searchbar', placeholderCaption, showValidIndicator = false },
      state: { namespaceList, activeSuggestion, query, queryParts, showSuggestions }
    } = this;

    return (
      <form onSubmit={handleSubmit} id={id}>
        <div className="form-group search-form-group">
          <div className="input-group inline-search-input-group">
            <input
              autoFocus={!isSmallScreen()}
              className={`form-control search-input ${showValidIndicator ? isValidQuery() : ''}`}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholderCaption}
              onFocus={handleFocusShowSuggestions}
              ref={input => this.search = input}
              spellCheck={false}
              value={query}
            />
            {button && (
              <div className="input-group-append">
                <button className="btn btn-primary">
                  {buttonCaption}
                </button>
              </div>
            )}
          </div>
          {showSuggestions && (
            <SearchSuggestions
              mouseOver={handleMouseOver}
              onClick={handleSuggestionClick}
              query={query}
              queryParts={queryParts}
              searchSuggestionList={namespaceList}
              selectedSearchSuggestion={activeSuggestion}
            />
          )}
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

export default connect (mapStateToProps, mapDispatchToProps)(Search);
