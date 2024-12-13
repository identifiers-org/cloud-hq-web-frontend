import React from 'react';

import PropsTypes from 'prop-types';
import SearchSuggestions from './SearchSuggestions';
import { useNavigate } from "react-router-dom";


class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
    }

    this.suggestionListRef = React.createRef();
  }

  handleChange = (e) => {
    this.setState({
      query: e.target.value
    });
  };

  handleKeyDown = e => {
    switch (e.key) {
      case 'Escape': {
        e.preventDefault();
        this.suggestionListRef.current?.clearSelection();
        break;
      }

      case 'Enter': {
        e.preventDefault();
        if (this.suggestionListRef.current?.hasSelection()) {
          this.suggestionListRef.current?.clickSelection();
        } else {
          this.handleSubmit(e)
        }
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        this.suggestionListRef.current?.upSelection()
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        this.suggestionListRef.current?.downSelection();
        break;
      }

      case 'PageDown': {
        e.preventDefault();
        this.suggestionListRef.current?.downSelection(5);
        break;
      }

      case 'PageUp': {
        e.preventDefault();
        this.suggestionListRef.current?.upSelection(5);
        break;
      }
    }
  }

  handleSubmit = e => {
    e.preventDefault();

    const {
      props: { navigate },
      state: { query }
    } = this;

    navigate(`/registry?query=${query}`);
  }


  render() {
    const {
      props: { buttonCaption, placeholderCaption},
      state: { query }
    } = this;

    return (
      <form onSubmit={this.handleSubmit} role='search'>
        <div className="form-group search-form-group">
          <div className="input-group inline-search-input-group">
            <input
              role='searchbox'
              className='form-control search-input'
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
              placeholder={placeholderCaption}
              ref={this.search}
              spellCheck={false}
              value={query}
            />
            <div className="input-group-append">
              <button className="btn btn-primary">
                {buttonCaption}
              </button>
            </div>
          </div>
          { query && <SearchSuggestions query={query} ref={this.suggestionListRef} /> }
        </div>
      </form>
    )
  }
}
Search.propTypes = {
  buttonCaption: PropsTypes.oneOfType([PropsTypes.element, PropsTypes.string]).isRequired,
  placeholderCaption: PropsTypes.string.isRequired,
  navigate: PropsTypes.func.isRequired
}
export default (props) => <Search {...props} navigate={useNavigate()} />;
