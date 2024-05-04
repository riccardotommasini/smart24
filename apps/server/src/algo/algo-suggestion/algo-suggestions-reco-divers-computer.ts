import { IAlgoField, IAlgoFieldOther } from '../../models/algo/algo-field';
import { AlgoSuggestionReconfComputer, AlgoSuggestionReconfConfig } from './algo-suggestions-reconf-computer';

interface AlgoSuggestionRecoDiversConfig extends AlgoSuggestionReconfConfig {
    diversityCoefficient: number; // 1=only top users, 0=only avg. users
}

export class AlgoSuggestionsRecoDiversComputer<
    Config extends AlgoSuggestionRecoDiversConfig = AlgoSuggestionRecoDiversConfig,
> extends AlgoSuggestionReconfComputer<Config> {
    protected getTopUsers(userEntry: IAlgoField): IAlgoFieldOther[] {
        const nTopUsers = Math.round(this.config.diversityCoefficient * this.config.kTopUsers);
        const nAvgUsers = this.config.kTopUsers - nTopUsers;

        const sortedUsers = userEntry.others.sort((a, b) => b.score - a.score);
        const topUsers = sortedUsers.slice(0, nTopUsers);

        // Get the rest of the users and select the middle ones
        let restUsers = sortedUsers.slice(nTopUsers);
        restUsers = restUsers.slice(Math.floor(restUsers.length / 2), restUsers.length);
        restUsers = restUsers.slice(0, nAvgUsers);

        return topUsers.concat(restUsers);
    }
}
