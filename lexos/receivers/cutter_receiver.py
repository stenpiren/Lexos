from typing import NamedTuple

from lexos.receivers.base_receiver import BaseReceiver


class CutterFrontEndOption(NamedTuple):
    """The typed tuple to implement cutter options."""
    # This is the id of the file to be compared
    cutting_value: str
    cutting_type: str
    last_prop: str
    overlap: str


class CutterReceiver(BaseReceiver):

    def __init__(self):
        """The Receiver to get all the similarity options"""
        super().__init__()

    def options_from_front_end(self) -> CutterFrontEndOption:
        """Get the similarity option from front end

        :return: a similarity option object that holds all the options
        """

        return CutterFrontEndOption(cutting_value="",
                                    cutting_type="",
                                    last_prop="",
                                    overlap="")
