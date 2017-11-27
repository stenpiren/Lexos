import re
from typing import Dict, NamedTuple, Optional, Set

from lexos.models.base_model import BaseModel
from lexos.models.filemanager_model import FileManagerModel
from lexos.receivers.scrubber_receiver import ScrubbingOptions, \
    ScrubbingReceiver

FileIDContentMap = Dict[int, str]
GutenbergFileSet = Set[int]


class ScrubberTestOptions(NamedTuple):
    front_end_options: ScrubbingOptions
    file_id_content_map: FileIDContentMap
    gutenberg_file_set: GutenbergFileSet


class ScrubberModel(BaseModel):

    def __init__(self, test_options: Optional[ScrubberTestOptions]):
        """A class to scrub text documents.

        :param test_options: A set of scrubbing options used for unit testing.
        """

        super().__init__()
        if test_options is not None:
            self._test_file_id_content_map = test_options.file_id_content_map
            self._test_gutenberg_file_set = test_options.gutenberg_file_set
            self._test_front_end_options = test_options.front_end_options

        else:
            self._test_file_id_content_map = None
            self._test_gutenberg_file_set = None
            self._test_front_end_options = None

    @property
    def _file_id_content_map(self) -> FileIDContentMap:
        """A dictionary of active file IDs and content for the current session.

        :return: A FileIDContentMap.
        """

        return self._test_file_id_content_map \
            if self._test_file_id_content_map is not None \
            else FileManagerModel().load_file_manager() \
            .get_content_of_active_with_id()

    @property
    def _gutenberg_file_set(self) -> GutenbergFileSet:
        return self._test_gutenberg_file_set \
            if self._test_gutenberg_file_set is not None \
            else FileManagerModel().load_file_manager().\
            get_gutenberg_file_ids()

    @property
    def _options(self) -> ScrubbingOptions:
        """All the scrubbing options.

        :return: A NamedTuple of scrubbing options from the front end or test
            options.
        """

        return self._test_front_end_options \
            if self._test_front_end_options is not None \
            else ScrubbingReceiver().options_from_front_end()

    @staticmethod
    def _handle_gutenberg(text: str) -> str:
        """Removes Project Gutenberg boilerplate from text.

        :param text: A Project Gutenberg document.
        :return: The input text document without the Gutenberg boilerplate.
        """

        # find end of front boiler plate, assuming something like:
        #     *** START OF THIS PROJECT GUTENBERG EBOOK FRANKENSTEIN ***

        # This is a "non-greedy" regex pattern, meaning it will stop looking
        # and return after the first "***" (instead of deleting some of the
        # text if it finds "***" outside of the boilerplate.
        re_start_gutenberg = re.compile(
            r"\*\*\* START OF THIS PROJECT GUTENBERG.*?\*\*\*",
            re.IGNORECASE | re.UNICODE | re.MULTILINE)
        match = re.search(re_start_gutenberg, text)
        if match:
            end_boiler_front = match.end()
            # text saved without front boilerplate
            text = text[end_boiler_front:]
        else:
            re_start_gutenberg = re.compile(
                r"Copyright.*\n\n\n", re.IGNORECASE | re.UNICODE)
            match = re.search(re_start_gutenberg, text)
            if match:
                end_boiler_front = match.end()
                # text saved without front boilerplate
                text = text[end_boiler_front:]

        # now let's find the start of the ending boilerplate
        re_end_gutenberg = re.compile(
            r"End of.*?Project Gutenberg",
            re.IGNORECASE | re.UNICODE | re.MULTILINE)
        match = re.search(re_end_gutenberg, text)
        if match:
            start_boiler_end = match.start()
            # text saved without end boilerplate
            text = text[:start_boiler_end]

        return text

    def _scrub(self, doc_id: int) -> str:
        """Scrubs a single document with the provided ID.

        :param doc_id: The document's ID number.
        :return: The document's scrubbed text.
        """

        # Scrubbing order:
        #
        # Note:  lemmas and consolidations do NOT work on tags; in short,
        #        these manipulations do not change inside any tags
        #
        # 0. Gutenberg
        # 1. lower
        #    (not applied in tags ever;
        #    lemmas/consolidations/specialChars/stopKeepWords changed;
        #    text not changed at this point)
        # 2. special characters
        # 3. tags - scrub tags
        # 4. punctuation
        #    (hyphens, apostrophes, ampersands);
        #    text not changed at this point, not applied in tags ever
        # 5. digits (text not changed at this point, not applied in tags ever)
        # 6. white space (text not changed at this point, not applied in tags
        #    ever, otherwise tag attributes will be messed up)
        # 7. consolidations
        #    (text not changed at this point, not applied in tags ever)
        # 8. lemmatize (text not changed at this point, not applied in tags
        #    ever)
        # 9. stop words/keep words
        #    (text not changed at this point, not applied in tags ever)
        #
        # apply:
        # 0. remove Gutenberg boiler plate (if any)
        # 1. lowercase
        # 2. consolidation
        # 3. lemmatize
        # 4. stop words
        # 5. remove punctuation, digits, and whitespace without changing all
        #    the content in the tag

        text = self._file_id_content_map[doc_id]

        # -- 0. Gutenberg -----------------------------------------------------
        if doc_id in self._gutenberg_file_set:
            text = self._handle_gutenberg(text=text)

        # -- 1. lower ---------------------------------------------------------
        if self._options.basic_options.lower:    # User wants to ignore case
            def to_lower_function(original_text: str) -> str:
                """Removes capital letters from a text.

                :param original_text: A mixed-case string.
                :return: The text with all caps converted to lowercase.
                """

                return original_text.lower()

        else:
            def to_lower_function(original_text: str) -> str:
                """Returns the string it is passed.

                :param original_text: A text string.
                :return: original_text, unchanged.
                """

                return original_text

        # -- 2. special characters --------------------------------------------

        return text

    def _scrub_all_docs(self):
        """Updates all active documents with their scrubbed text."""

        for text_id in self._file_id_content_map:
            scrubbed_text = self._scrub(text_id)
            self._file_id_content_map[text_id] = scrubbed_text

        # need to put this back into file manager
