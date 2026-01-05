"""
Unit tests for validation functions.
"""

import pytest
from todo.validation import validate_command, validate_id, validate_title, validate_description
from todo.errors import InvalidCommandError, ValidationError, InvalidIDError, EmptyInputError


class TestValidateCommand:
    """Tests for validate_command()."""

    def test_valid_commands(self):
        """Test all valid commands are accepted."""
        valid_commands = ["add", "list", "update", "delete", "complete", "incomplete", "help", "exit"]

        for cmd in valid_commands:
            assert validate_command(cmd) == cmd.lower()

    def test_case_insensitive(self):
        """Test commands are case-insensitive."""
        assert validate_command("ADD") == "add"
        assert validate_command("List") == "list"
        assert validate_command("HeLp") == "help"

    def test_whitespace_trimming(self):
        """Test whitespace is trimmed from commands."""
        assert validate_command("  add  ") == "add"
        assert validate_command("\tlist\n") == "list"

    def test_empty_command(self):
        """Test empty command raises EmptyInputError."""
        with pytest.raises(EmptyInputError):
            validate_command("")

        with pytest.raises(EmptyInputError):
            validate_command("   ")

    def test_invalid_command(self):
        """Test invalid command raises InvalidCommandError."""
        with pytest.raises(InvalidCommandError) as exc_info:
            validate_command("invalid")

        assert "Unknown command 'invalid'" in str(exc_info.value)


class TestValidateId:
    """Tests for validate_id()."""

    def test_valid_ids(self):
        """Test valid integer IDs are parsed correctly."""
        assert validate_id("1") == 1
        assert validate_id("42") == 42
        assert validate_id("999") == 999

    def test_whitespace_trimming(self):
        """Test whitespace is trimmed from IDs."""
        assert validate_id("  5  ") == 5
        assert validate_id("\t10\n") == 10

    def test_non_integer_id(self):
        """Test non-integer ID raises InvalidIDError."""
        with pytest.raises(InvalidIDError) as exc_info:
            validate_id("abc")

        assert "Invalid task ID 'abc'" in str(exc_info.value)

    def test_empty_id(self):
        """Test empty ID raises InvalidIDError."""
        with pytest.raises(InvalidIDError):
            validate_id("")

        with pytest.raises(InvalidIDError):
            validate_id("   ")

    def test_negative_id(self):
        """Test negative ID raises InvalidIDError."""
        with pytest.raises(InvalidIDError) as exc_info:
            validate_id("-1")

        assert "must be a positive number" in str(exc_info.value)

    def test_zero_id(self):
        """Test zero ID raises InvalidIDError."""
        with pytest.raises(InvalidIDError):
            validate_id("0")

    def test_float_id(self):
        """Test float ID raises InvalidIDError."""
        with pytest.raises(InvalidIDError):
            validate_id("1.5")


class TestValidateTitle:
    """Tests for validate_title()."""

    def test_valid_titles(self):
        """Test valid titles are accepted."""
        assert validate_title("Buy groceries") == "Buy groceries"
        assert validate_title("Fix bug #123") == "Fix bug #123"
        assert validate_title("a" * 100) == "a" * 100  # Max length

    def test_whitespace_trimming(self):
        """Test whitespace is trimmed from titles."""
        assert validate_title("  Title with spaces  ") == "Title with spaces"
        assert validate_title("\tTabbed\n") == "Tabbed"

    def test_empty_title(self):
        """Test empty title raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_title("")

        assert "Title cannot be empty" in str(exc_info.value)

    def test_whitespace_only_title(self):
        """Test whitespace-only title raises ValidationError."""
        with pytest.raises(ValidationError):
            validate_title("   ")

        with pytest.raises(ValidationError):
            validate_title("\t\n")

    def test_title_too_long(self):
        """Test title exceeding 100 characters raises ValidationError."""
        long_title = "a" * 101

        with pytest.raises(ValidationError) as exc_info:
            validate_title(long_title)

        assert "exceeds 100 characters" in str(exc_info.value)
        assert "current: 101" in str(exc_info.value)

    def test_title_exactly_100_chars(self):
        """Test title with exactly 100 characters is accepted."""
        title = "a" * 100
        assert validate_title(title) == title

    def test_title_one_char(self):
        """Test single character title is accepted."""
        assert validate_title("a") == "a"


class TestValidateDescription:
    """Tests for validate_description()."""

    def test_valid_descriptions(self):
        """Test valid descriptions are accepted."""
        assert validate_description("A description") == "A description"
        assert validate_description("a" * 500) == "a" * 500  # Max length

    def test_empty_description(self):
        """Test empty description is accepted."""
        assert validate_description("") == ""
        assert validate_description("   ") == ""  # Trimmed to empty

    def test_whitespace_trimming(self):
        """Test whitespace is trimmed from descriptions."""
        assert validate_description("  Description  ") == "Description"
        assert validate_description("\tTabbed\n") == "Tabbed"

    def test_description_too_long(self):
        """Test description exceeding 500 characters raises ValidationError."""
        long_desc = "a" * 501

        with pytest.raises(ValidationError) as exc_info:
            validate_description(long_desc)

        assert "exceeds 500 characters" in str(exc_info.value)
        assert "current: 501" in str(exc_info.value)

    def test_description_exactly_500_chars(self):
        """Test description with exactly 500 characters is accepted."""
        desc = "a" * 500
        assert validate_description(desc) == desc

    def test_description_boundary_cases(self):
        """Test description boundary lengths."""
        assert validate_description("a" * 499) == "a" * 499
        assert validate_description("a" * 500) == "a" * 500

        with pytest.raises(ValidationError):
            validate_description("a" * 501)
