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
        """Get the cutter option from front end

        :return: a cutter option object that holds all the options
        """
        override_id =


        cutting_value = self._front_end_data['cutValue' + option_identifier] \
            if 'cutByMS' + option_identifier not in self._front_end_data \
            else self._front_end_data['MScutWord' + option_identifier]

        cutting_type = self._front_end_data['cutType' + option_identifier] \
            if 'cutByMS' + option_identifier not in self._front_end_data \
            else 'milestone'

        overlap = self._front_end_data['cutOverlap' + option_identifier] \
            if 'cutOverlap' + option_identifier in self._front_end_data \
            else '0'

        last_prop = self._front_end_data['cutLastProp' + option_identifier].\
            strip('%') \
            if 'cutLastProp' + option_identifier in self._front_end_data else\
            '50'

        return CutterFrontEndOption(cutting_value=cutting_value,
                                    cutting_type=cutting_type,
                                    last_prop=last_prop,
                                    overlap=overlap)

